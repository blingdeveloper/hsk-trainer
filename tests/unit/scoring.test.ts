import { describe, expect, it } from 'vitest';
import { SETS } from '../../src/content/sets';

const QUESTIONS = SETS.flatMap((s) => s.questions);
import { formatClock, isCorrect, scaledMinutes, scoreSections } from '../../src/features/exam/scoring';

describe('scoring', () => {
  it('marks answers correctly, ignoring case and whitespace', () => {
    const q = QUESTIONS.find((q) => q.id === 'a-r2-1')!;
    expect(isCorrect(q, 'C')).toBe(true);
    expect(isCorrect(q, ' c ')).toBe(true);
    expect(isCorrect(q, 'A')).toBe(false);
    expect(isCorrect(q, undefined)).toBe(false);
  });

  it('marks written characters', () => {
    const q = QUESTIONS.find((q) => q.id === 'a-w2-1')!;
    expect(isCorrect(q, '学')).toBe(true);
    expect(isCorrect(q, '字')).toBe(false);
  });

  it('scores each section from an all-correct answer sheet', () => {
    const answers = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.correctAnswer]));
    const scores = scoreSections(QUESTIONS, answers);
    for (const s of scores) expect(s.correct).toBe(s.total);
    expect(scores.reduce((n, s) => n + s.total, 0)).toBe(QUESTIONS.length);
  });

  it('counts unanswered questions as wrong', () => {
    const scores = scoreSections(QUESTIONS, {});
    expect(scores.every((s) => s.correct === 0)).toBe(true);
  });

  it('scales official timing per question', () => {
    expect(scaledMinutes(15, { questions: 25, minutes: 25 })).toBe(15);
    expect(scaledMinutes(10, { questions: 10, minutes: 10 })).toBe(10);
  });

  it('formats the clock', () => {
    expect(formatClock(65_000)).toBe('1:05');
    expect(formatClock(-5)).toBe('0:00');
  });
});
