// Converts CC-CEDICT numbered pinyin ("ni3 hao3") to tone-marked pinyin ("nǐ hǎo").

const TONE_MARKS: Record<string, string[]> = {
  a: ['ā', 'á', 'ǎ', 'à', 'a'],
  e: ['ē', 'é', 'ě', 'è', 'e'],
  i: ['ī', 'í', 'ǐ', 'ì', 'i'],
  o: ['ō', 'ó', 'ǒ', 'ò', 'o'],
  u: ['ū', 'ú', 'ǔ', 'ù', 'u'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
};

/** Index of the vowel that carries the tone mark, using the standard rules. */
function toneVowelIndex(syllable: string): number {
  const s = syllable.toLowerCase();
  const a = s.indexOf('a');
  if (a >= 0) return a;
  const e = s.indexOf('e');
  if (e >= 0) return e;
  const ou = s.indexOf('ou');
  if (ou >= 0) return ou;
  // Otherwise the last vowel takes the mark (e.g. "gui" -> u, "liu" -> u).
  for (let i = s.length - 1; i >= 0; i--) {
    if ('iouü'.includes(s[i])) return i;
  }
  return -1;
}

export function syllableToMarked(raw: string): string {
  const m = /^([a-zA-ZüÜ:]+)([1-5])$/.exec(raw);
  if (!m) return raw.replace(/u:/g, 'ü').replace(/U:/g, 'Ü');
  const letters = m[1].replace(/u:/g, 'ü').replace(/U:/g, 'Ü').replace(/v/g, 'ü');
  const tone = Number(m[2]);
  // "r5" is the erhua suffix: written as a bare "r".
  if (letters.toLowerCase() === 'r' && tone === 5) return letters;
  const idx = toneVowelIndex(letters);
  if (idx < 0) return letters;
  const ch = letters[idx];
  const lower = ch.toLowerCase();
  let marked = TONE_MARKS[lower]?.[tone - 1] ?? ch;
  if (ch !== lower) marked = marked.toUpperCase();
  return letters.slice(0, idx) + marked + letters.slice(idx + 1);
}

/** "ni3 hao3" -> "nǐ hǎo". Non-syllable tokens (",", "·", "A") pass through. */
export function numberedToMarked(pinyin: string): string {
  return pinyin
    .split(' ')
    .map(syllableToMarked)
    .join(' ');
}

const TONE_OF: Record<string, number> = {};
for (const marks of Object.values(TONE_MARKS)) marks.slice(0, 4).forEach((m, i) => (TONE_OF[m] = i + 1));

/** Tone number 1–4 of a marked syllable, or 5 for neutral. */
export function toneOf(syllable: string): number {
  for (const ch of syllable.toLowerCase()) if (TONE_OF[ch]) return TONE_OF[ch];
  return 5;
}

function setTone(syllable: string, tone: number): string {
  const plain = syllable.normalize('NFD').replace(/[̀-̄̌]/g, '').normalize('NFC');
  return syllableToMarked(`${plain}${tone}`);
}

/**
 * Pinyin for a word as textbooks write it: syllables joined ("diànnǎo"),
 * an apostrophe before a/e/o ("Xī'ān"), erhua attached ("yíhuìr"), and the tone
 * changes of 一 and 不 ("yíhuìr", "búcuò"). Names keep their spaces ("Lǐ Míng").
 */
export function wordPinyin(word: string, pinyin: string): string {
  const chars = [...word];
  const syllables = pinyin.split(' ');
  if (syllables.length < 2) return pinyin;
  if (syllables.length === chars.length) {
    syllables.forEach((s, i) => {
      const next = syllables[i + 1];
      if (!next || /^r$/i.test(next)) return;
      const nextTone = toneOf(next);
      const prev = chars[i - 1];
      // 一 keeps yī when counting or ordinal (第一, 十一) and at the end of a word.
      if (chars[i] === '一' && s.toLowerCase() === 'yī' && !/[第十〇零]/.test(prev ?? '')) {
        syllables[i] = setTone(s, nextTone === 4 ? 2 : 4);
      }
      if (chars[i] === '不' && s.toLowerCase() === 'bù' && nextTone === 4) syllables[i] = setTone(s, 2);
    });
  }
  let out = syllables[0];
  for (const s of syllables.slice(1)) {
    if (/^[A-ZĀÁǍÀĒÉĚÈŌÓǑÒ]/.test(s)) out += ` ${s}`; // a new name starts
    else if (/^r$/.test(s)) out += 'r';
    else if (/^[aeoāáǎàēéěèōóǒò]/i.test(s)) out += `'${s}`;
    else out += s;
  }
  return out;
}
