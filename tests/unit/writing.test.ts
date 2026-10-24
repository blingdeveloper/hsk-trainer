import { beforeEach, describe, expect, it } from 'vitest';
import { db, recordWritingQuiz, RECALLS_TO_LEARN, type WritingProgress } from '../../src/db/db';
import { pickSession } from '../../src/features/characters/CharactersView';

describe('writing progress', () => {
  beforeEach(async () => {
    await db.writing.clear();
  });

  it('counts only good from-memory quizzes as recalls', async () => {
    await recordWritingQuiz('学', 'trace', 0, 1);
    await recordWritingQuiz('学', 'memory', 3, 2);
    await recordWritingQuiz('学', 'memory', 1, 3);
    expect(await db.writing.get('学')).toEqual({ char: '学', recalls: 1, attempts: 3, mistakes: 4, lastPracticed: 3 });
  });

  it(`is learned after ${RECALLS_TO_LEARN} good recalls`, async () => {
    for (let i = 0; i < RECALLS_TO_LEARN; i++) await recordWritingQuiz('一', 'memory', 0, i);
    expect((await db.writing.get('一'))!.recalls).toBe(RECALLS_TO_LEARN);
  });
});

describe('pickSession', () => {
  const p = (char: string, recalls: number, lastPracticed: number): [string, WritingProgress] => [
    char,
    { char, recalls, attempts: recalls + 1, mistakes: 0, lastPracticed },
  ];

  it('skips learned characters and puts new and weak ones first', () => {
    const progress = new Map([p('爱', RECALLS_TO_LEARN, 5), p('八', 1, 1), p('爸', 0, 9)]);
    expect(pickSession(['爱', '八', '爸', '百'], progress, 10)).toEqual(['百', '爸', '八']);
  });

  it('respects the session size and list order for ties', () => {
    expect(pickSession(['a', 'b', 'c'], new Map(), 2)).toEqual(['a', 'b']);
  });
});
