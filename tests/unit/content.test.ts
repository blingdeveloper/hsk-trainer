import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../../src/content/levels';

const SETS = [...LEVELS[1].sets, ...LEVELS[2].sets];

const hsk = JSON.parse(readFileSync('public/packs/core/hsk.json', 'utf8'));
const writingChars = new Set<string>(hsk.writingChars['1-2']);
const dict = JSON.parse(readFileSync('public/packs/core/dict.json', 'utf8')) as { entries: [string, string, string, string[], number][] };

/**
 * Characters a level may use: its syllabus reading characters, plus every character of
 * its syllabus words. The syllabus lists some HSK 1 words whose characters belong to a
 * higher character list (商店 and 饭店 are HSK 1 words, but 店 is an HSK 2 character).
 */
const levelChars = (level: 1 | 2) =>
  new Set<string>([
    ...LEVELS[level].readingLevels.flatMap((l) => hsk.readingChars[l]),
    ...dict.entries.filter((e) => e[4] > 0 && e[4] <= level).flatMap((e) => [...e[0]]),
  ]);
// Allowed outside the HSK 1–2 character list: people's and place names (the official
// sample uses names with pinyin), and radicals shown as Writing Part 1 answer options.
const ALLOWED = new Set([...'王李北京', ...'亻扌氵讠口女日木']);

const isHan = (c: string) => /\p{Script=Han}/u.test(c);

describe.each(SETS.map((s) => ({ ...s, name: `${LEVELS[s.level].name} ${s.title}` })))('$name', (set) => {
  const groupOf = (id: string) => set.groups.find((g) => g.id === id)!;

  it('follows the official paper shape: Reading Parts 2–4 (15), plus Writing (10) where the level has it, 5 per part', () => {
    expect(set.questions.filter((q) => q.skill === 'reading')).toHaveLength(15);
    expect(set.questions.filter((q) => q.skill === 'writing')).toHaveLength(LEVELS[set.level].official.writing ? 10 : 0);
    expect(set.questions.every((q) => q.level === set.level)).toBe(true);
    for (const g of set.groups) expect(set.questions.filter((q) => q.groupId === g.id), g.id).toHaveLength(5);
  });

  it('question ids are unique and prefixed with the level and set', () => {
    const prefix = set.level === 1 ? `h1-${set.id}-` : `${set.id}-`;
    expect(new Set(set.questions.map((q) => q.id)).size).toBe(set.questions.length);
    for (const q of set.questions) expect(q.id.startsWith(prefix)).toBe(true);
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

  it(`uses only characters from the level's lists in questions and options`, () => {
    const allowed = levelChars(set.level);
    const texts = set.questions.flatMap((q) => [q.prompt, q.question ?? '', ...(q.options ?? []).map((o) => o.text)]);
    texts.push(...set.groups.flatMap((g) => (g.options ?? []).map((o) => o.text)));
    const above = new Set([...texts.join('')].filter((c) => isHan(c) && !allowed.has(c) && !ALLOWED.has(c)));
    expect([...above]).toEqual([]);
  });

  it('is honestly labelled as original HSK 3.0 level 2 content', () => {
    for (const q of set.questions) {
      expect(q.sourceType).toBe('original');
      expect(q.syllabusVersion).toBe('HSK3.0-2025-11');
      expect(q.level).toBe(set.level);
      expect(q.explanation.length).toBeGreaterThan(10);
    }
  });
});

it('ids are unique across both levels', () => {
  const ids = SETS.flatMap((s) => [...s.questions.map((q) => q.id), ...s.groups.map((g) => g.id)]);
  expect(new Set(ids).size).toBe(ids.length);
});

it('no question appears in two sets (either level)', () => {
  const prompts = SETS.flatMap((s) => s.questions.map((q) => q.prompt + (q.question ?? '')));
  expect(new Set(prompts).size).toBe(prompts.length);
});
