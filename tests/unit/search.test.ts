import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { Dictionary } from '../../src/features/dictionary/dictionary';
import { DictionarySearch } from '../../src/features/dictionary/search';

const pack = JSON.parse(readFileSync('public/packs/core/dict.json', 'utf8'));
const search = new DictionarySearch(new Dictionary(pack.entries, pack.meta));
const words = (q: string, level = 1, kind: 'pinyin' | 'english' = 'pinyin') => search.search(q, level)[kind].map((r) => r.word);
const top = (q: string, n: number, level = 1, kind: 'pinyin' | 'english' = 'pinyin') => words(q, level, kind).slice(0, n);

describe('reading typed text as pinyin', () => {
  const ways = (q: string) => search.parsePinyin(q).map((w) => w.map((s) => s.base + (s.tone ?? '') + (s.partial ? '…' : '')).join(' '));

  it('splits run-together syllables', () => {
    expect(ways('nihao')).toContain('ni hao');
    expect(ways('xian')).toEqual(expect.arrayContaining(['xian', 'xi an']));
  });

  it('reads tone numbers and tone marks', () => {
    // "hao3" could also be "ha o3"; both readings are tried.
    expect(ways('ni3hao3')[0]).toBe('ni3 hao3');
    expect(ways('nǐhǎo')[0]).toBe('ni3 hao3');
    expect(ways('lü4')).toEqual(['lv4']);
    expect(ways('lu:4')).toEqual(['lv4']);
  });

  it('treats an unfinished last syllable as the start of one', () => {
    expect(ways('zh')).toEqual(['zh…']);
  });

  it('rejects text that cannot be pinyin', () => {
    expect(ways('write')).toEqual([]);
    expect(ways('hello!')).toEqual([]);
    expect(ways('')).toEqual([]);
  });
});

describe('pinyin search', () => {
  it('finds a word with or without tones and spaces', () => {
    for (const q of ['nihao', 'ni hao', 'ni3hao3', 'nǐ hǎo', "ni'hao"]) expect(top(q, 1)).toEqual(['你好']);
  });

  it('lists HSK words first, whole syllables before longer words', () => {
    const ma = words('ma');
    expect(ma.slice(0, 2).sort()).toEqual(['吗', '妈']);
    expect(ma.indexOf('妈妈')).toBeLessThan(ma.indexOf('马'));
    expect(ma.indexOf('马')).toBeLessThan(ma.indexOf('麻'));
  });

  it('filters by tone when one is given', () => {
    const results = search.search('ma3', 1).pinyin;
    expect(results[0].word).toBe('马');
    for (const r of results) expect(r.entry.pinyin.normalize('NFD')).toMatch(/^mǎ/i);
  });

  it('gives a character the level of the HSK word it is part of', () => {
    const ma = search.search('ma', 1).pinyin.find((r) => r.word === '妈')!;
    expect(ma.level).toBe(1);
    expect(ma.via).toBe('妈妈');
  });

  it('shows the HSK reading, not a rare one', () => {
    const xie = search.search('xie', 1).pinyin.find((r) => r.word === '写')!;
    expect(xie.entry.pinyin).toBe('xiě');
    expect(top('xie', 4)).toEqual(expect.arrayContaining(['些', '写', '谢', '谢谢']));
  });

  it('accepts v for ü', () => {
    expect(top('lv', 4)).toEqual(expect.arrayContaining(['旅', '绿']));
  });

  it('suggests words while a syllable is still being typed', () => {
    expect(top('zh', 6)).toEqual(expect.arrayContaining(['这', '找']));
  });

  it('puts the level you are studying first', () => {
    // 游泳 is HSK 2: higher up for an HSK 2 learner than for an HSK 1 learner.
    expect(words('you', 2).indexOf('游泳')).toBeLessThan(words('you', 1).indexOf('游泳'));
    for (const r of search.search('you', 1).pinyin.slice(0, 5)) expect(r.level).toBe(1);
  });
});

describe('English search', () => {
  it('finds the word whose meaning is exactly what was typed first', () => {
    expect(top('write', 1, 1, 'english')).toEqual(['写']);
    expect(top('to eat', 1, 1, 'english')).toEqual(['吃']);
    expect(top('happy', 1, 1, 'english')).toEqual(['高兴']);
    expect(top('hello', 1, 1, 'english')).toEqual(['你好']);
    expect(top('big', 1, 1, 'english')).toEqual(['大']);
  });

  it('is not fooled by pinyin inside cross-references', () => {
    // 超市's meaning mentions 超级市场[chao1 ji2 shi4 chang3].
    expect(words('shi', 1, 'english')).not.toContain('超市');
  });

  it('shows English first when it fits better than the pinyin reading', () => {
    expect(search.search('big', 1).englishFirst).toBe(true);
    expect(search.search('ma', 1).englishFirst).toBe(false);
  });

  it('opens Chinese characters directly, traditional included', () => {
    expect(search.search('学', 1).direct).toBe('学');
    expect(search.search('學習', 1).direct).toBe('学习');
  });

  it('is fast enough to search as you type', () => {
    const t = performance.now();
    for (const q of ['m', 'ma', 'mo', 'mot', 'moth', 'mothe', 'mother']) search.search(q, 2);
    expect(performance.now() - t).toBeLessThan(500);
  });
});
