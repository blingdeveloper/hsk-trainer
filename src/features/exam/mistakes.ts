import type { TaskType } from '../../content/types';
import type { StudyAttempt } from '../../db/db';

/** Error categories from the brief (§2.5), mapped from the task type. */
export const CATEGORY: Record<TaskType, string> = {
  'reading-2-word-bank': 'Vocabulary & grammar in context',
  'reading-3-response-match': 'Dialogue responses',
  'reading-4-short-passage': 'Reading comprehension',
  'writing-1-component': 'Character components',
  'writing-2-character': 'Character writing',
};

export interface MistakeSummary {
  questionId: string;
  /** Most recent answer, which was wrong ('' = not answered). */
  lastAnswer: string;
  lastWrongAt: number;
  timesWrong: number;
  /** True while the latest attempt is wrong; false once answered correctly afterwards ("fixed"). */
  open: boolean;
}

/**
 * A question is an open mistake while its latest attempt is wrong.
 * Answering it correctly later moves it to "fixed".
 */
export function summariseMistakes(attempts: StudyAttempt[]): MistakeSummary[] {
  const byQuestion = new Map<string, StudyAttempt[]>();
  for (const a of attempts) {
    const list = byQuestion.get(a.questionId);
    if (list) list.push(a);
    else byQuestion.set(a.questionId, [a]);
  }
  const out: MistakeSummary[] = [];
  for (const [questionId, list] of byQuestion) {
    list.sort((a, b) => a.timestamp - b.timestamp || (a.id ?? 0) - (b.id ?? 0));
    const wrong = list.filter((a) => !a.correct);
    if (!wrong.length) continue;
    const lastWrong = wrong[wrong.length - 1];
    out.push({
      questionId,
      lastAnswer: lastWrong.answer,
      lastWrongAt: lastWrong.timestamp,
      timesWrong: wrong.length,
      open: !list[list.length - 1].correct,
    });
  }
  return out.sort((a, b) => b.lastWrongAt - a.lastWrongAt);
}
