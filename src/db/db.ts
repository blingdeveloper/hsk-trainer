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

  constructor(name = 'hsk-trainer') {
    super(name);
    this.version(1).stores({
      attempts: '++id, questionId, sessionId, timestamp',
      saved: '++id, &[itemType+itemRef], createdAt',
      settings: 'id',
    });
  }
}

export const db = new AppDB();

export async function getSettings(): Promise<UserSettings> {
  return (await db.settings.get('me')) ?? DEFAULT_SETTINGS;
}
