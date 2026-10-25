import { HSK1_SETS } from './hsk1';
import { SETS as HSK2_SETS } from './sets';
import type { LevelId, PracticeSet, Skill, TaskType } from './types';

export interface SectionSpec {
  questions: number;
  minutes: number;
}

/** Everything that differs between levels. Screens and the exam engine read from this. */
export interface LevelConfig {
  id: LevelId;
  name: string;
  /** Official sections from the CTI sample paper (listening isn't available in the app yet). */
  official: { listening: SectionSpec; reading: SectionSpec; writing?: SectionSpec; totalMinutes: number; totalQuestions: number };
  /** Short description of the official paper for the Practice screen. */
  formatSummary: string;
  /** What the app's papers leave out, and why. */
  notIncluded: string;
  sets: PracticeSet[];
  /**
   * Mock exam layout in paper order: each entry is a task type and which set (0, 1, 2…
   * counted from the mock's rotation) supplies that group.
   */
  mockLayout: { taskType: TaskType; fromSet: number }[];
  /** Paper ids are prefixed so levels never collide ("set-a" for HSK 2 keeps old progress valid). */
  paperPrefix: string;
  /** Characters a level's questions may use: syllabus reading lists up to this level. */
  readingLevels: number[];
}

export const LEVELS: Record<LevelId, LevelConfig> = {
  1: {
    id: 1,
    name: 'HSK 1',
    official: { listening: { questions: 20, minutes: 12 }, reading: { questions: 20, minutes: 20 }, totalMinutes: 40, totalQuestions: 40 },
    formatSummary: 'Listening 20 questions (~12 min), Reading 20 (20 min). No writing section. About 40 minutes in total.',
    notIncluded: 'Listening (20 questions, ~12 min, then 3 min to fill in the answer sheet) and Reading Part 1 (5 picture questions)',
    sets: HSK1_SETS,
    mockLayout: [
      { taskType: 'reading-3-response-match', fromSet: 0 },
      { taskType: 'reading-2-word-bank', fromSet: 1 },
      { taskType: 'reading-4-short-passage', fromSet: 2 },
    ],
    paperPrefix: 'h1-',
    readingLevels: [1],
  },
  2: {
    id: 2,
    name: 'HSK 2',
    official: {
      listening: { questions: 25, minutes: 17 },
      reading: { questions: 25, minutes: 25 },
      writing: { questions: 10, minutes: 10 },
      totalMinutes: 60,
      totalQuestions: 60,
    },
    formatSummary: 'Listening 25 questions (~17 min), Reading 25 (25 min), Writing 10 (10 min). About 60 minutes in total.',
    notIncluded: 'Listening (25 questions, ~17 min, then 3 min to fill in the answer sheet) and Reading Part 1 (5 picture questions)',
    sets: HSK2_SETS,
    mockLayout: [
      { taskType: 'reading-2-word-bank', fromSet: 0 },
      { taskType: 'reading-3-response-match', fromSet: 1 },
      { taskType: 'reading-3-response-match', fromSet: 2 },
      { taskType: 'reading-4-short-passage', fromSet: 2 },
      { taskType: 'writing-1-component', fromSet: 1 },
      { taskType: 'writing-2-character', fromSet: 0 },
    ],
    paperPrefix: '',
    readingLevels: [1, 2],
  },
};

export const LEVEL_IDS: LevelId[] = [1, 2];

export function level(id: LevelId | number | undefined): LevelConfig {
  return LEVELS[(id === 1 ? 1 : 2) as LevelId];
}

/** Official time per question for a section, used to scale practice timing. */
export function officialSection(levelId: LevelId, skill: Skill): SectionSpec {
  const l = LEVELS[levelId].official;
  return (skill === 'writing' ? l.writing : l.reading) ?? l.reading;
}
