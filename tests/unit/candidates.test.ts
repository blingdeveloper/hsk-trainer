import { describe, expect, it } from 'vitest';
import { rankCandidates, RARE_PENALTY } from '../../src/features/handwriting/recogniser';

describe('rankCandidates', () => {
  const common = new Set(['人', '入', '八', '大', '口']);

  it('brings common characters ahead of rare radicals', () => {
    // Raw recogniser order for a drawn 人 (from a real run): 人入卜刂丄又丿乂
    // 八 (common, 9th) ties with 卜 (rare, 3rd); recognition order breaks the tie.
    expect(rankCandidates([...'人入卜刂丄又丿乂八'], common, 6)).toEqual([...'人入卜八刂丄']);
  });

  it('keeps a rare character first when nothing common is close', () => {
    expect(rankCandidates([...'匸匚'], common, 5)).toEqual([...'匸匚']);
  });

  it('only lets a common character overtake within the penalty window', () => {
    const raw = ['囗', ...'abcdefgh'.split(''), '口'];
    expect(raw.indexOf('口')).toBeGreaterThan(RARE_PENALTY);
    expect(rankCandidates(raw, common, 3)[0]).toBe('囗');
  });
});
