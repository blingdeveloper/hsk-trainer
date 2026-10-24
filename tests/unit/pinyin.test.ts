import { describe, expect, it } from 'vitest';
import { numberedToMarked } from '../../src/lib/pinyin';

describe('numberedToMarked', () => {
  it.each([
    ['ni3 hao3', 'nǐ hǎo'],
    ['Zhong1 guo2', 'Zhōng guó'],
    ['lu:4 se4', 'lǜ sè'],
    ['nu:3 er2', 'nǚ ér'],
    ['gui4', 'guì'],
    ['liu2', 'liú'],
    ['dou1', 'dōu'],
    ['xue2 xiao4', 'xué xiào'],
    ['ma5', 'ma'],
    ['yi1 hui4 r5', 'yī huì r'],
  ])('%s → %s', (input, expected) => {
    expect(numberedToMarked(input)).toBe(expected);
  });

  it('passes through punctuation and letters', () => {
    expect(numberedToMarked('A A zhi4 , ·')).toBe('A A zhì , ·');
  });
});
