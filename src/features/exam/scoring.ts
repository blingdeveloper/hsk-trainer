import type { Question, Skill } from '../../content/types';

export type Answers = Record<string, string>;

export function normaliseAnswer(answer: string): string {
  return answer.trim().toUpperCase();
}

export function isCorrect(q: Question, answer: string | undefined): boolean {
  if (!answer) return false;
  return normaliseAnswer(answer) === normaliseAnswer(q.correctAnswer);
}

export interface SectionScore {
  skill: Skill;
  correct: number;
  total: number;
}

/** Raw score per section. Official HSK 3.0 scaled scores and pass marks are not published, so none are shown. */
export function scoreSections(questions: Question[], answers: Answers): SectionScore[] {
  const bySkill = new Map<Skill, SectionScore>();
  for (const q of questions) {
    const s = bySkill.get(q.skill) ?? { skill: q.skill, correct: 0, total: 0 };
    s.total++;
    if (isCorrect(q, answers[q.id])) s.correct++;
    bySkill.set(q.skill, s);
  }
  return [...bySkill.values()];
}

/** Minutes for a practice section, scaled from the official per-question timing. */
export function scaledMinutes(questionCount: number, official: { questions: number; minutes: number }): number {
  return Math.max(1, Math.round((questionCount / official.questions) * official.minutes));
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
