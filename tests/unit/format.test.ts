import { describe, expect, it } from 'vitest';
import { definitionText, formatDefinition } from '../../src/features/dictionary/format';
import { toneOf, wordPinyin } from '../../src/lib/pinyin';

describe('wordPinyin', () => {
  it.each([
    ['电脑', 'diàn nǎo', 'diànnǎo'],
    ['一会儿', 'yī huì r', 'yíhuìr'],
    ['一起', 'yī qǐ', 'yìqǐ'],
    ['一下', 'yī xià', 'yíxià'],
    ['不是', 'bù shì', 'búshì'],
    ['不好', 'bù hǎo', 'bùhǎo'],
    ['第一', 'dì yī', 'dìyī'],
    ['十一', 'shí yī', 'shíyī'],
    ['西安', 'Xī ān', "Xī'ān"],
    ['中国', 'Zhōng guó', 'Zhōngguó'],
    ['李明', 'Lǐ Míng', 'Lǐ Míng'],
    ['学', 'xué', 'xué'],
  ])('%s: %s → %s', (word, pinyin, expected) => {
    expect(wordPinyin(word, pinyin)).toBe(expected);
  });

  it('reads tones', () => {
    expect([toneOf('mā'), toneOf('má'), toneOf('mǎ'), toneOf('mà'), toneOf('ma')]).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('formatDefinition', () => {
  it('turns CL: into measure words with readable pinyin', () => {
    expect(formatDefinition('CL:臺|台[tai2]')).toEqual({ kind: 'measure', segments: [{ word: '台', pinyin: 'tái' }] });
    expect(definitionText('CL:個|个[ge4],隻|只[zhi1]')).toBe('measure word: 个 (gè), 只 (zhī)');
  });

  it('links references and keeps the surrounding text', () => {
    expect(formatDefinition('the Great Learning, one of the Four Books 四書|四书[Si4 shu1] in Confucianism').segments).toEqual([
      { text: 'the Great Learning, one of the Four Books ' },
      { word: '四书', pinyin: 'Sìshū' },
      { text: ' in Confucianism' },
    ]);
    expect(definitionText('old variant of 和[he2]')).toBe('old variant of 和 (hé)');
  });

  it('writes pronunciation notes in words', () => {
    expect(definitionText('also pr. [yi1 hui3 r5]')).toBe('also pronounced yī huǐ r');
    expect(definitionText('Taiwan pr. [zhong4 yong4]')).toBe('Taiwan pronunciation: zhòng yòng');
  });

  it('leaves ordinary definitions alone', () => {
    expect(definitionText('to learn')).toBe('to learn');
  });
});
