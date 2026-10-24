// Shared types for HSK 2 practice content.
// Task types follow the official HSK 3.0 Level 2 sample paper (CTI, "HSK（二级）样卷", 2026).

export type Skill = 'reading' | 'writing';
export type TaskType =
  | 'reading-2-word-bank'
  | 'reading-3-response-match'
  | 'reading-4-short-passage'
  | 'writing-1-component'
  | 'writing-2-character';

export interface Option {
  key: string;
  text: string;
  pinyin?: string;
}

export interface QuestionGroup {
  id: string;
  skill: Skill;
  taskType: TaskType;
  /** Matching part of the official paper, e.g. "Reading Part 2". */
  officialPart: string;
  instructions: string;
  /** Shared answer options (word bank, response list, component list). */
  options?: Option[];
}

export interface Question {
  id: string;
  groupId: string;
  syllabusVersion: 'HSK3.0-2025-11';
  level: 2;
  skill: Skill;
  taskType: TaskType;
  prompt: string;
  pinyin?: string;
  /** Statement under ★ for passage questions. */
  question?: string;
  /** Per-question options (passage questions). Shared ones live on the group. */
  options?: Option[];
  /** Writing Part 1: the word with the incomplete character, and the part already written. */
  component?: { word: string; pinyin: string; index: number; shown: string };
  correctAnswer: string;
  explanation: string;
  sourceType: 'original';
  formatVerified: true;
  verification: 'author-checked';
}


export interface PracticeSet {
  id: string;
  title: string;
  groups: QuestionGroup[];
  questions: Question[];
}

export const ORIGINAL_LABEL = 'Original practice. Not official HSK questions. The format follows the official HSK 3.0 Level 2 sample paper.';

/** Official HSK 3.0 Level 2 timing (sample paper): listening 25 q / ~17 min, reading 25 q / 25 min, writing 10 q / 10 min. */
export const OFFICIAL_SECTIONS = {
  listening: { questions: 25, minutes: 17 },
  reading: { questions: 25, minutes: 25 },
  writing: { questions: 10, minutes: 10 },
};

/** Fields shared by every original question. */
export const ORIGINAL = {
  syllabusVersion: 'HSK3.0-2025-11',
  level: 2,
  sourceType: 'original',
  formatVerified: true,
  verification: 'author-checked',
} as const;

/** The five task groups every practice set uses, in paper order. */
export function standardGroups(setId: string, options: { r2: Option[]; r3: Option[]; w1: Option[] }): QuestionGroup[] {
  return [
    { id: `${setId}-r2`, skill: 'reading', taskType: 'reading-2-word-bank', officialPart: 'Reading Part 2', instructions: 'Choose the word that fills the gap. One word is not used.', options: options.r2 },
    { id: `${setId}-r3`, skill: 'reading', taskType: 'reading-3-response-match', officialPart: 'Reading Part 3', instructions: 'Choose the best reply to each sentence. One reply is not used.', options: options.r3 },
    { id: `${setId}-r4`, skill: 'reading', taskType: 'reading-4-short-passage', officialPart: 'Reading Part 4', instructions: 'Read the passage, then choose the answer to the ★ question.' },
    { id: `${setId}-w1`, skill: 'writing', taskType: 'writing-1-component', officialPart: 'Writing Part 1', instructions: 'Each word has one character with a part missing. Choose the missing part. One part is not used.', options: options.w1 },
    { id: `${setId}-w2`, skill: 'writing', taskType: 'writing-2-character', officialPart: 'Writing Part 2', instructions: 'Write the character for the pinyin in brackets. Type it or draw it on the pad.' },
  ];
}

type Draft = Omit<Question, keyof typeof ORIGINAL | 'groupId' | 'skill' | 'taskType'>;

/** Fills in the shared fields for a list of questions in one group. */
export function inGroup(group: QuestionGroup, drafts: Draft[]): Question[] {
  return drafts.map((d) => ({ ...ORIGINAL, ...d, groupId: group.id, skill: group.skill, taskType: group.taskType }));
}
