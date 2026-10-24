import { describe, expect, it } from 'vitest';
import type { StudyAttempt } from '../../src/db/db';
import { summariseMistakes } from '../../src/features/exam/mistakes';

let n = 0;
const attempt = (questionId: string, correct: boolean, timestamp: number, answer = correct ? 'C' : 'A'): StudyAttempt => ({
  id: ++n,
  questionId,
  sessionId: 's',
  mode: 'guided',
  answer,
  correct,
  timestamp,
  elapsedMs: 0,
});

describe('summariseMistakes', () => {
  it('lists a question while its latest answer is wrong', () => {
    const [m] = summariseMistakes([attempt('q1', true, 1), attempt('q1', false, 2, 'B')]);
    expect(m).toMatchObject({ questionId: 'q1', open: true, timesWrong: 1, lastAnswer: 'B', lastWrongAt: 2 });
  });

  it('marks it fixed once answered correctly afterwards', () => {
    const [m] = summariseMistakes([attempt('q1', false, 1), attempt('q1', false, 2), attempt('q1', true, 3)]);
    expect(m).toMatchObject({ open: false, timesWrong: 2 });
  });

  it('ignores questions never answered wrongly', () => {
    expect(summariseMistakes([attempt('q1', true, 1), attempt('q2', true, 2)])).toEqual([]);
  });

  it('treats unanswered (blank) as a mistake and sorts newest first', () => {
    const list = summariseMistakes([attempt('old', false, 1), attempt('blank', false, 5, '')]);
    expect(list.map((m) => m.questionId)).toEqual(['blank', 'old']);
    expect(list[0].lastAnswer).toBe('');
  });

  it('orders attempts by time even if stored out of order', () => {
    const [m] = summariseMistakes([attempt('q1', true, 9), attempt('q1', false, 3)]);
    expect(m.open).toBe(false);
  });
});
