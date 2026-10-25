import { describe, expect, it } from 'vitest';
import { findPaper, MOCK_PAPERS, paperFromMistakes, SET_PAPERS } from '../../src/features/exam/papers';

describe('practice set papers', () => {
  it('keep 15 reading + 10 writing and scaled timing', () => {
    for (const p of SET_PAPERS) {
      expect(p.sections).toEqual(['reading', 'writing']);
      expect(p.questions.filter((q) => q.skill === 'reading')).toHaveLength(15);
      expect(p.minutes).toEqual({ reading: 15, writing: 10 });
    }
  });
});

describe('mock exams', () => {
  it.each(MOCK_PAPERS)('$title follows the official part order and sizes', (p) => {
    expect(p.groups.map((g) => g.taskType)).toEqual([
      'reading-2-word-bank',
      'reading-3-response-match',
      'reading-3-response-match',
      'reading-4-short-passage',
      'writing-1-component',
      'writing-2-character',
    ]);
    expect(p.questions).toHaveLength(30);
    expect(p.questions.filter((q) => q.skill === 'reading')).toHaveLength(20);
    // Official pace: 25 min for 25 reading questions, 10 min for 10 writing questions.
    expect(p.minutes).toEqual({ reading: 20, writing: 10 });
    // The two Reading Part 3 groups come from different sets.
    expect(new Set(p.groups.map((g) => g.id)).size).toBe(6);
  });

  it('the three mocks are different papers', () => {
    const keys = MOCK_PAPERS.map((p) => p.groups.map((g) => g.id).join());
    expect(new Set(keys).size).toBe(3);
  });

  it('questions follow group order, reading before writing', () => {
    const p = MOCK_PAPERS[0];
    const skills = p.questions.map((q) => q.skill);
    expect(skills.lastIndexOf('reading')).toBeLessThan(skills.indexOf('writing'));
  });
});

describe('mistake papers', () => {
  it('rebuild from question ids, keep only needed sections, reading first', () => {
    const p = paperFromMistakes(['b-w2-3', 'a-r2-1', 'a-r2-4', 'missing-id']);
    expect(p.questions.map((q) => q.id)).toEqual(['a-r2-1', 'a-r2-4', 'b-w2-3']);
    expect(p.sections).toEqual(['reading', 'writing']);
    expect(paperFromMistakes(['c-r4-2']).sections).toEqual(['reading']);
  });

  it('can be found again from saved ids', () => {
    expect(findPaper('mistakes', ['a-r2-1'])?.questions).toHaveLength(1);
    expect(findPaper('mistakes')).toBeUndefined();
    expect(findPaper('mock-2')?.title).toBe('Mock exam 2');
  });
});

describe('HSK 1 papers', () => {
  it('practice sets: Reading Parts 2–4 in official order, 15 questions, 15 min, no writing', async () => {
    const { setPapers } = await import('../../src/features/exam/papers');
    for (const p of setPapers(1)) {
      expect(p.id).toMatch(/^h1-set-[abc]$/);
      expect(p.level).toBe(1);
      expect(p.sections).toEqual(['reading']);
      expect(p.groups.map((g) => g.officialPart)).toEqual(['Reading Part 2', 'Reading Part 3', 'Reading Part 4']);
      expect(p.questions).toHaveLength(15);
      // Official HSK 1 pace: 20 min for 20 reading questions.
      expect(p.minutes).toEqual({ reading: 15 });
    }
  });

  it('mock exams follow the HSK 1 paper and are all different', async () => {
    const { mockPapers } = await import('../../src/features/exam/papers');
    const mocks = mockPapers(1);
    expect(mocks.map((m) => m.id)).toEqual(['h1-mock-1', 'h1-mock-2', 'h1-mock-3']);
    for (const m of mocks) {
      expect(m.groups.map((g) => g.taskType)).toEqual(['reading-3-response-match', 'reading-2-word-bank', 'reading-4-short-passage']);
      expect(m.questions).toHaveLength(15);
      expect(m.minutes).toEqual({ reading: 15 });
      expect(new Set(m.questions.map((q) => q.level))).toEqual(new Set([1]));
    }
    expect(new Set(mocks.map((m) => m.groups.map((g) => g.id).join())).size).toBe(3);
  });

  it('HSK 2 paper ids are unchanged, so saved progress stays valid', async () => {
    const { setPapers, mockPapers, findPaper } = await import('../../src/features/exam/papers');
    expect(setPapers(2).map((p) => p.id)).toEqual(['set-a', 'set-b', 'set-c']);
    expect(mockPapers(2).map((p) => p.id)).toEqual(['mock-1', 'mock-2', 'mock-3']);
    expect(findPaper('h1-mock-2')?.level).toBe(1);
    expect(findPaper('mock-2')?.level).toBe(2);
  });

  it('a mistakes paper takes its level from its questions', async () => {
    const { paperFromMistakes } = await import('../../src/features/exam/papers');
    const p = paperFromMistakes(['h1-b-p3-2', 'h1-a-p2-1']);
    expect(p.level).toBe(1);
    expect(p.questions.map((q) => q.id)).toEqual(['h1-a-p2-1', 'h1-b-p3-2']);
  });
});
