import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../../src/content/levels';

const SETS = [1, 2].flatMap((l) => [...LEVELS[l as 1 | 2].sets, ...LEVELS[l as 1 | 2].pictureSets]);
import type { Question } from '../../src/content/types';

// Checks every pinyin line in the practice content against CC-CEDICT readings,
// character by character. Tone differences are only allowed where Mandarin
// changes the tone: neutral-tone syllables and the tone sandhi of 一 and 不.

const dict = JSON.parse(readFileSync('public/packs/core/dict.json', 'utf8'));
const readings = new Map<string, Set<string>>();
for (const [simp, , py] of dict.entries as [string, string, string][]) {
  if ([...simp].length !== 1) continue;
  const set = readings.get(simp) ?? new Set<string>();
  set.add(py.toLowerCase().replace(/\s/g, ''));
  readings.set(simp, set);
}

const toneless = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ü/g, 'u');
const hasTone = (s: string) => toneless(s) !== s.normalize('NFD').replace(/̈/g, '').normalize('NFC').replace(/ü/g, 'u') || /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(s);
const isHan = (c: string) => /\p{Script=Han}/u.test(c);
// Sandhi: 一 and 不 change tone before other syllables.
const SANDHI = new Set(['一', '不']);

type Aligned = { cost: number; notes: string[]; syls: string[] };

/** Splits `py` into one syllable per character, preferring exact dictionary readings. */
function align(chars: string[], py: string): Aligned | null {
  const target = py.toLowerCase().replace(/[^a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/g, '');
  const memo = new Map<string, Aligned | null>();
  const go = (i: number, p: number): Aligned | null => {
    const key = `${i},${p}`;
    if (memo.has(key)) return memo.get(key)!;
    let res: Aligned | null = null;
    if (i === chars.length) res = p === target.length ? { cost: 0, notes: [], syls: [] } : null;
    else {
      const c = chars[i];
      const opts = [...(readings.get(c) ?? [])];
      for (let len = 1; len <= 7 && p + len <= target.length; len++) {
        const syl = target.slice(p, p + len);
        let cost = -1;
        let note = '';
        if (opts.includes(syl)) cost = 0;
        else if (opts.some((o) => toneless(o) === toneless(syl))) {
          if (SANDHI.has(c) || !hasTone(syl)) cost = 0; // sandhi or neutral tone: fine
          else {
            cost = 1;
            note = `${c} written "${syl}", dictionary has ${opts.join('/')}`;
          }
        }
        if (cost < 0) continue;
        const rest = go(i + 1, p + len);
        if (rest && (!res || rest.cost + cost < res.cost)) res = { cost: rest.cost + cost, notes: note ? [note, ...rest.notes] : rest.notes, syls: [syl, ...rest.syls] };
      }
    }
    memo.set(key, res);
    return res;
  };
  return go(0, 0);
}

// The reading the HSK syllabus uses for each word (the data build marks it: 要 yào, not yāo; 猫 māo, not máo).
// A rare reading can be a real dictionary entry, so matching the dictionary alone isn't enough.
// Some words have more than one syllabus reading (只 zhī as a measure word, zhǐ "only"); any of them is accepted.
const hskReading = new Map<string, string[][]>();
for (const [simp, , py, , level, preferred] of dict.entries as [string, string, string, string[], number, number][]) {
  if (!preferred || level <= 0 || level > 3) continue;
  hskReading.set(simp, [...(hskReading.get(simp) ?? []), py.toLowerCase().split(' ')]);
}
const longestHskWord = Math.max(...[...hskReading.keys()].map((w) => [...w].length));

/** Notes where the pinyin uses a different reading from the syllabus, word by word (longest HSK word first). */
function syllabusReadingNotes(chars: string[], syls: string[]): string[] {
  const notes: string[] = [];
  for (let i = 0; i < chars.length; ) {
    let len = Math.min(longestHskWord, chars.length - i);
    while (len > 0 && !hskReading.has(chars.slice(i, i + len).join(''))) len--;
    if (len === 0) {
      i++;
      continue;
    }
    const word = chars.slice(i, i + len).join('');
    const readingsOfWord = hskReading.get(word)!;
    const fits = (want: string[]) =>
      want.every((w, k) => {
        const got = syls[i + k];
        if (!got || got === w || toneless(got) !== toneless(w)) return true; // other syllable mismatches are caught by align()
        return SANDHI.has(chars[i + k]) || !hasTone(w) || !hasTone(got); // sandhi and neutral tone
      });
    if (!readingsOfWord.some(fits)) {
      const written = syls.slice(i, i + len).join(' ');
      notes.push(`${word} written "${written}"; the HSK syllabus reading is ${readingsOfWord.map((r) => `"${r.join(' ')}"`).join(' or ')}`);
    }
    i += len;
  }
  return notes;
}

/** Every (Chinese, pinyin) pair shown to the learner, with blanks filled by the answer. */
function pairs(q: Question, options: { key: string; text: string; pinyin?: string }[] | undefined): [string, string][] {
  const out: [string, string][] = [];
  if (q.pinyin) {
    let text = q.prompt;
    let py = q.pinyin;
    if (q.taskType === 'reading-2-word-bank') {
      const opt = options!.find((o) => o.key === q.correctAnswer)!;
      text = text.replace('（ ）', opt.text);
      py = py.replace('( )', opt.pinyin!);
    } else if (q.taskType === 'writing-2-character') {
      text = text.replace('（ ）', q.correctAnswer);
      py = py.replace(/[()]/g, ' ');
    }
    out.push([text, py]);
  }
  if (q.component) out.push([q.component.word, q.component.pinyin]);
  for (const o of q.options ?? []) if (o.pinyin) out.push([o.text, o.pinyin]);
  return out;
}

describe.each(SETS.map((s) => ({ ...s, name: `${LEVELS[s.level].name} ${s.title}` })))('$name pinyin', (set) => {
  it('matches the dictionary for every character', () => {
    const problems: string[] = [];
    const check = (where: string, text: string, py: string) => {
      const a = align([...text].filter(isHan), py);
      if (!a) problems.push(`${where}: can't match "${py}" to "${text}"`);
      else for (const n of [...a.notes, ...syllabusReadingNotes([...text].filter(isHan), a.syls)]) problems.push(`${where}: ${n}`);
    };
    for (const q of set.questions) {
      const group = set.groups.find((g) => g.id === q.groupId)!;
      for (const [text, py] of pairs(q, group.options)) check(q.id, text, py);
    }
    for (const g of set.groups) for (const o of g.options ?? []) if (o.pinyin) check(`${g.id} ${o.key}`, o.text, o.pinyin);
    expect(problems).toEqual([]);
  });
});

describe('pinyin checker', () => {
  const run = (text: string, py: string) => align([...text], py);
  it('accepts correct pinyin, sandhi and neutral tones', () => {
    expect(run('我们', 'wǒmen')?.cost).toBe(0);
    expect(run('一起', 'yìqǐ')?.cost).toBe(0); // 一 sandhi
    expect(run('不是', 'bú shì')?.cost).toBe(0); // 不 sandhi
    expect(run('衣服', 'yīfu')?.cost).toBe(0); // neutral tone
  });
  it('catches wrong tones and wrong syllables', () => {
    expect(run('我们', 'wómen')?.cost).toBe(1);
    expect(run('学校', 'xuéxiāo')?.cost).toBe(1);
    expect(run('学校', 'xiéxiào')).toBeNull(); // 学 is never xié
    expect(run('我们', 'wǒ')).toBeNull();
  });
  it('catches a real but non-HSK reading (猫 máo exists in the dictionary; the syllabus has māo)', () => {
    const a = run('小猫', 'xiǎo máo')!;
    expect(a.cost).toBe(0);
    expect(syllabusReadingNotes([...'小猫'], a.syls)).toHaveLength(1);
    const b = run('小猫', 'xiǎo māo')!;
    expect(syllabusReadingNotes([...'小猫'], b.syls)).toEqual([]);
  });
});
