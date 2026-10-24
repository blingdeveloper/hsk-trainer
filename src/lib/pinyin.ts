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
