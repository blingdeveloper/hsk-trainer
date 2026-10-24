import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { SETS } from '../../src/content/sets';

const hsk = JSON.parse(readFileSync('public/packs/core/hsk.json', 'utf8'));
const writingChars = new Set<string>(hsk.writingChars['1-2']);
const level12Chars = new Set<string>([...hsk.readingChars[1], ...hsk.readingChars[2]]);
// Allowed outside the HSK 1–2 character list: people's and place names (the official
// sample uses names with pinyin), and radicals shown as Writing Part 1 answer options.
const ALLOWED = new Set([...'王李北京', ...'亻扌氵讠口女日木']);

const isHan = (c: string) => /\p{Script=Han}/u.test(c);

describe.each(SETS)('$title', (set) => {
  const groupOf = (id: string) => set.groups.find((g) => g.id === id)!;

  it('follows the official paper shape: 15 reading + 10 writing, 5 per part', () => {
    expect(set.questions.filter((q) => q.skill === 'reading')).toHaveLength(15);
    expect(set.questions.filter((q) => q.skill === 'writing')).toHaveLength(10);
    for (const g of set.groups) expect(set.questions.filter((q) => q.groupId === g.id), g.id).toHaveLength(5);
  });

  it('question ids are unique and prefixed with the set id', () => {
    expect(new Set(set.questions.map((q) => q.id)).size).toBe(set.questions.length);
    for (const q of set.questions) expect(q.id.startsWith(`${set.id}-`)).toBe(true);
  });

  it('every question sits in a group of its own task type', () => {
    for (const q of set.questions) expect(groupOf(q.groupId)?.taskType, q.id).toBe(q.taskType);
  });

  it('every answer key points at an existing option', () => {
    for (const q of set.questions) {
      if (q.taskType === 'writing-2-character') continue;
      const options = q.options ?? groupOf(q.groupId).options!;
      expect(options.map((o) => o.key), q.id).toContain(q.correctAnswer);
    }
  });

  it('shared-option groups use each key once and leave exactly one distractor', () => {
    for (const g of set.groups.filter((g) => g.options)) {
      const keys = set.questions.filter((q) => q.groupId === g.id).map((q) => q.correctAnswer);
      expect(new Set(keys).size, g.id).toBe(keys.length);
      expect(g.options!.length - keys.length, g.id).toBe(1);
    }
  });

  it('Writing Part 1 shows a real word with the missing character in it', () => {
    for (const q of set.questions.filter((q) => q.component)) {
      const { word, index } = q.component!;
      expect([...word][index], q.id).toBeTruthy();
    }
  });

  it('writing answers are characters from the official HSK 1–2 writing list', () => {
    for (const q of set.questions.filter((q) => q.taskType === 'writing-2-character')) {
      expect(writingChars.has(q.correctAnswer), q.id).toBe(true);
    }
  });

  it('uses only HSK 1–2 characters in questions and options', () => {
    const texts = set.questions.flatMap((q) => [q.prompt, q.question ?? '', ...(q.options ?? []).map((o) => o.text)]);
    texts.push(...set.groups.flatMap((g) => (g.options ?? []).map((o) => o.text)));
    const above = new Set([...texts.join('')].filter((c) => isHan(c) && !level12Chars.has(c) && !ALLOWED.has(c)));
    expect([...above]).toEqual([]);
  });

  it('is honestly labelled as original HSK 3.0 level 2 content', () => {
    for (const q of set.questions) {
      expect(q.sourceType).toBe('original');
      expect(q.syllabusVersion).toBe('HSK3.0-2025-11');
      expect(q.level).toBe(2);
      expect(q.explanation.length).toBeGreaterThan(10);
    }
  });
});

it('no question appears in two sets', () => {
  const prompts = SETS.flatMap((s) => s.questions.map((q) => q.prompt + (q.question ?? '')));
  expect(new Set(prompts).size).toBe(prompts.length);
});
