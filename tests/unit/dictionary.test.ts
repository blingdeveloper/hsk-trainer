import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { Dictionary } from '../../src/features/dictionary/dictionary';

const pack = JSON.parse(readFileSync('public/packs/core/dict.json', 'utf8'));
const dict = new Dictionary(pack.entries, pack.meta);

describe('Dictionary (real CC-CEDICT pack)', () => {
  it('opens the correct entry for a known character', () => {
    const entries = dict.lookup('学');
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].pinyin).toBe('xué');
    expect(entries[0].definitions.join(' ')).toMatch(/learn|study/);
    expect(entries[0].traditional).toBe('學');
  });

  it('tags HSK 3.0 levels from the syllabus', () => {
    expect(dict.level('学校')).toBe(1);
    expect(dict.level('已经')).toBe(2);
  });

  it('only lists dictionary-confirmed words containing the character', () => {
    const words = dict.wordsContaining('学');
    expect(words).toContain('学校');
    expect(words).toContain('学生');
    for (const w of words) {
      expect(dict.has(w)).toBe(true);
      expect(w).toContain('学');
    }
    // HSK-tagged words are listed first.
    expect(dict.level(words[0])).toBeDefined();
  });

  it('puts the common reading before proper-noun readings', () => {
    const [first] = dict.lookup('大学');
    expect(first.pinyin).toBe('dà xué');
    expect(first.definitions.join(' ')).toMatch(/university/);
  });

  it.each([
    ['么', 'me'],
    ['要', 'yào'],
    ['和', 'hé'],
    ['为', 'wèi'],
    ['还', 'hái'],
    ['行', 'xíng'],
  ])('shows the HSK reading of %s first (%s)', (char, pinyin) => {
    expect(dict.lookup(char)[0].pinyin).toBe(pinyin);
    expect(dict.lookup(char)[0].definitions.join(' ')).not.toMatch(/^old variant/);
  });

  it('finds traditional forms', () => {
    expect(dict.toSimplified('學')).toBe('学');
    expect(dict.toSimplified('電腦')).toBe('电脑');
    expect(dict.toSimplified('学')).toBe('学');
    expect(dict.toSimplified('abc')).toBeUndefined();
  });

  it('returns nothing (rather than inventing) for unknown words', () => {
    expect(dict.lookup('学猫')).toEqual([]);
  });

  it('carries source and licence metadata', () => {
    expect(dict.meta.source).toBe('CC-CEDICT');
    expect(dict.meta.licence).toBe('CC BY-SA 4.0');
  });
});
