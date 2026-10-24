import Dexie, { type EntityTable } from 'dexie';

export interface StudyAttempt {
  id?: number;
  questionId: string;
  sessionId: string;
  mode: 'guided' | 'timed';
  answer: string;
  correct: boolean;
  timestamp: number;
  elapsedMs: number;
}

export interface SavedItem {
  id?: number;
  itemType: 'character' | 'word';
  itemRef: string;
  createdAt: number;
}

/** Progress on one character from the official HSK 1–2 writing list (书写字). */
export interface WritingProgress {
  char: string;
  /** Completed from-memory quizzes with at most one mistake. */
  recalls: number;
  attempts: number;
  mistakes: number;
  lastPracticed: number;
}

/** A character counts as learned after this many good from-memory recalls. */
export const RECALLS_TO_LEARN = 2;

export interface UserSettings {
  id: 'me';
  targetLevel: number;
  syllabusVersion: string;
  examDate?: string;
  showPinyin: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  id: 'me',
  targetLevel: 2,
  syllabusVersion: 'HSK3.0-2025-11',
  examDate: '2026-12-13',
  showPinyin: true,
};

export class AppDB extends Dexie {
  attempts!: EntityTable<StudyAttempt, 'id'>;
  saved!: EntityTable<SavedItem, 'id'>;
  settings!: EntityTable<UserSettings, 'id'>;
  writing!: EntityTable<WritingProgress, 'char'>;

  constructor(name = 'hsk-trainer') {
    super(name);
    this.version(1).stores({
      attempts: '++id, questionId, sessionId, timestamp',
      saved: '++id, &[itemType+itemRef], createdAt',
      settings: 'id',
    });
    this.version(2).stores({
      writing: 'char, lastPracticed',
    });
  }
}

export const db = new AppDB();

export async function getSettings(): Promise<UserSettings> {
  return (await db.settings.get('me')) ?? DEFAULT_SETTINGS;
}

/** Records one finished writing quiz. Only from-memory quizzes with ≤ 1 mistake count as a recall. */
export async function recordWritingQuiz(char: string, mode: 'trace' | 'memory', mistakes: number, now = Date.now()) {
  await db.transaction('rw', db.writing, async () => {
    const p = (await db.writing.get(char)) ?? { char, recalls: 0, attempts: 0, mistakes: 0, lastPracticed: 0 };
    p.attempts++;
    p.mistakes += mistakes;
    p.lastPracticed = now;
    if (mode === 'memory' && mistakes <= 1) p.recalls++;
    await db.writing.put(p);
  });
}
