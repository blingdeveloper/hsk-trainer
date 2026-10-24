// Turns the raw datasets in data-raw/ into the small offline packs in public/packs/.
// Run after `npm run fetch:data` with: npm run build:data
import { readFile, writeFile, mkdir, rm, copyFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import { numberedToMarked } from '../../src/lib/pinyin.ts';

const RAW = path.resolve('data-raw');
const OUT = path.resolve('public/packs');
const require = createRequire(import.meta.url);

// ---------- 1. Official HSK 3.0 syllabus: level tags only ----------

function pdfPages(first, last) {
  return execFileSync(
    'pdftotext',
    ['-raw', '-f', String(first), '-l', String(last), path.join(RAW, 'hsk-syllabus-2025.pdf'), '-'],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
}

/** Vocabulary list rows: "403 2（5） 面1 miàn 后缀、（动、名、量）". */
function parseVocab(text) {
  const levels = new Map();
  for (const line of text.split('\n')) {
    const m = /^\d+ (\d(?:-\d)?)(?:（[\d-]+）)* (\S+?)\d? [a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü'’·\-/ ]+/.exec(line.trim());
    if (!m) continue;
    const level = m[1].includes('-') ? 7 : Number(m[1]);
    // Some words are listed with alternatives, e.g. "爸爸|爸". Tag each form.
    for (const word of m[2].split(/[|｜]/)) {
      if (!levels.has(word) || levels.get(word) > level) levels.set(word, level);
    }
  }
  return levels;
}

/** Character lists: "1. 爱" / "169.四". */
function parseCharList(text) {
  const chars = [];
  for (const line of text.split('\n')) {
    const m = /^\d+\.\s*(\S)/u.exec(line.trim());
    if (m) chars.push(m[1]);
  }
  return chars;
}

/** Splits a page range into the lists that start with the given headings. */
function splitByHeadings(text, headings) {
  const out = {};
  const positions = headings.map((h) => [h, text.indexOf(h)]).filter(([, i]) => i >= 0);
  positions.sort((a, b) => a[1] - b[1]);
  positions.forEach(([h, start], i) => {
    const end = i + 1 < positions.length ? positions[i + 1][1] : text.length;
    out[h] = text.slice(start + h.length, end);
  });
  return out;
}

const vocabLevels = parseVocab(pdfPages(80, 355));
const readingText = splitByHeadings(pdfPages(356, 376), [
  'HSK（一级）认读字',
  'HSK（二级）认读字',
  'HSK（三级）认读字',
  'HSK（四级）认读字',
]);
const readingChars = {
  1: parseCharList(readingText['HSK（一级）认读字']),
  2: parseCharList(readingText['HSK（二级）认读字']),
  3: parseCharList(readingText['HSK（三级）认读字']),
};
const writingText = splitByHeadings(pdfPages(377, 378), ['HSK（一级）~（二级）书写字', 'HSK（三级）书写字']);
const writingChars12 = parseCharList(writingText['HSK（一级）~（二级）书写字']);

const countAtLevel = (n) => [...vocabLevels.values()].filter((l) => l === n).length;
console.log(
  `syllabus: ${vocabLevels.size} words (L1 ${countAtLevel(1)}, L2 ${countAtLevel(2)}, L3 ${countAtLevel(3)}), ` +
    `reading chars L1 ${readingChars[1].length} / L2 ${readingChars[2].length} / L3 ${readingChars[3].length}, ` +
    `writing chars L1–2 ${writingChars12.length}`,
);

// ---------- 2. CC-CEDICT subset ----------

const cedictText = await readFile(path.join(RAW, 'cedict_ts.u8'), 'utf8');
const cedictDate = /#! date=(\S+)/.exec(cedictText)?.[1] ?? 'unknown';
const mmah = JSON.parse(await readFile(path.join(RAW, 'mmah.json'), 'utf8'));
const recognisable = new Set(mmah.chars.map((c) => c[0]));

// Words are kept when every character is an HSK 1–3 reading character, so the
// "words containing this character" lists stay relevant to your level.
const studyChars = new Set([...readingChars[1], ...readingChars[2], ...readingChars[3]]);

const entries = [];
for (const line of cedictText.split('\n')) {
  if (!line || line.startsWith('#')) continue;
  const m = /^(\S+) (\S+) \[([^\]]*)\] \/(.*)\/\s*$/.exec(line);
  if (!m) continue;
  const [, trad, simp, pinyin, defs] = m;
  const chars = [...simp];
  const keep = chars.length === 1 ? recognisable.has(simp) || studyChars.has(simp) : chars.every((c) => studyChars.has(c));
  if (!keep) continue;
  const definitions = defs.split('/').filter(Boolean);
  // Compact row: [simplified, traditional, tone-marked pinyin, definitions, hskLevel|0]
  entries.push([simp, trad === simp ? '' : trad, numberedToMarked(pinyin), definitions, vocabLevels.get(simp) ?? 0]);
}

const taggedWords = new Set(entries.filter((e) => e[4]).map((e) => e[0]));
const untagged = [...vocabLevels].filter(([w, l]) => l <= 2 && !taggedWords.has(w)).map(([w]) => w);
console.log(`cedict: ${entries.length} entries kept; HSK 1–2 words with no CC-CEDICT match: ${untagged.join(' ') || 'none'}`);

// ---------- 3. Stroke-order data (hanzi-writer-data, Arphic licence) ----------

const strokeChars = [...new Set([...studyChars, ...writingChars12])];
const strokeDir = path.join(OUT, 'strokes');
await rm(strokeDir, { recursive: true, force: true });
await mkdir(strokeDir, { recursive: true });
const hwdDir = path.dirname(require.resolve('hanzi-writer-data/package.json'));
let strokeCount = 0;
const missingStrokes = [];
for (const ch of strokeChars) {
  try {
    await copyFile(path.join(hwdDir, `${ch}.json`), path.join(strokeDir, `${ch}.json`));
    strokeCount++;
  } catch {
    missingStrokes.push(ch);
  }
}
console.log(`strokes: ${strokeCount} characters copied, missing: ${missingStrokes.join('') || 'none'}`);

// ---------- 4. Recogniser (HanziLookupJS) ----------

const vendorDir = path.resolve('public/vendor/hanzilookup');
await mkdir(vendorDir, { recursive: true });
await copyFile(path.join(RAW, 'hanzilookup.min.js'), path.join(vendorDir, 'hanzilookup.min.js'));
await copyFile(path.join(RAW, 'mmah.json'), path.join(vendorDir, 'mmah.json'));
await copyFile(path.join(RAW, 'HanziLookupJS-LICENSE-APL.txt'), path.join(vendorDir, 'LICENSE-APL.txt'));

// ---------- 5. Write packs + manifest ----------

await mkdir(path.join(OUT, 'core'), { recursive: true });
const dict = {
  meta: {
    source: 'CC-CEDICT',
    url: 'https://cc-cedict.org/',
    licence: 'CC BY-SA 4.0',
    version: cedictDate,
    hskTags: 'HSK 3.0 syllabus (CTI, published 2025-11) — level tags only',
  },
  entries,
};
const dictJson = JSON.stringify(dict);
await writeFile(path.join(OUT, 'core', 'dict.json'), dictJson);

const hsk = {
  meta: {
    source: '中文水平考试 HSK 考试大纲 (Chinese Testing International, 2025-11, effective 2026-07)',
    url: 'https://www.chinesetest.cn/hsk',
    licence: 'Copyright CTI. Character lists used for level tagging only.',
    syllabusVersion: 'HSK3.0-2025-11',
  },
  writingChars: { '1-2': writingChars12 },
  readingChars,
};
await writeFile(path.join(OUT, 'core', 'hsk.json'), JSON.stringify(hsk));

const manifest = {
  id: 'core',
  version: `cedict-${cedictDate.slice(0, 10)}`,
  files: {
    'packs/core/dict.json': { bytes: Buffer.byteLength(dictJson), sha256: createHash('sha256').update(dictJson).digest('hex') },
  },
  strokeChars: strokeChars.filter((c) => !missingStrokes.includes(c)),
};
await writeFile(path.join(OUT, 'core', 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`dict.json: ${(Buffer.byteLength(dictJson) / 1024 / 1024).toFixed(2)} MB`);
