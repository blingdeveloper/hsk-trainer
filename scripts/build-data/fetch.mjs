// Downloads the raw third-party datasets into data-raw/ (git-ignored).
// Run with: npm run fetch:data
import { mkdir, writeFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const RAW = path.resolve('data-raw');
const HANZILOOKUP_COMMIT = 'b21124f771ddd91f131e62aa478bc188f6ec78d3';

const sources = [
  {
    file: 'cedict.zip',
    url: 'https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.zip',
  },
  {
    file: 'hanzilookup.min.js',
    url: `https://raw.githubusercontent.com/gugray/HanziLookupJS/${HANZILOOKUP_COMMIT}/dist/hanzilookup.min.js`,
  },
  {
    file: 'mmah.json',
    url: `https://raw.githubusercontent.com/gugray/HanziLookupJS/${HANZILOOKUP_COMMIT}/dist/mmah.json`,
  },
  {
    file: 'HanziLookupJS-LICENSE-APL.txt',
    url: `https://raw.githubusercontent.com/gugray/HanziLookupJS/${HANZILOOKUP_COMMIT}/LICENSE-APL`,
  },
  {
    // Official HSK syllabus (CTI, 2025-11). Used only to derive level tags; never redistributed.
    file: 'hsk-syllabus-2025.pdf',
    url: 'https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf',
  },
];

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

await mkdir(RAW, { recursive: true });
for (const { file, url } of sources) {
  const dest = path.join(RAW, file);
  if (await exists(dest)) { console.log(`skip  ${file} (already downloaded)`); continue; }
  console.log(`fetch ${file}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

if (!(await exists(path.join(RAW, 'cedict_ts.u8')))) {
  execFileSync('unzip', ['-o', 'cedict.zip'], { cwd: RAW, stdio: 'inherit' });
}
console.log('done');
