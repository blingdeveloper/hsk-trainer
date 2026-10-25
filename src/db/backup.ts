import { db, type ExamInProgress, type SavedItem, type StudyAttempt, type UserSettings, type WritingProgress } from './db';

/** Bump when the backup shape changes; older backups stay importable. */
export const BACKUP_VERSION = 1;

export interface Backup {
  app: 'hsk-trainer';
  version: number;
  exportedAt: string;
  tables: {
    attempts: StudyAttempt[];
    writing: WritingProgress[];
    saved: SavedItem[];
    settings: UserSettings[];
    exam: ExamInProgress[];
  };
}

export async function exportBackup(now = new Date()): Promise<Backup> {
  const [attempts, writing, saved, settings, exam] = await Promise.all([
    db.attempts.toArray(),
    db.writing.toArray(),
    db.saved.toArray(),
    db.settings.toArray(),
    db.exam.toArray(),
  ]);
  return { app: 'hsk-trainer', version: BACKUP_VERSION, exportedAt: now.toISOString(), tables: { attempts, writing, saved, settings, exam } };
}

export function backupFileName(now = new Date()): string {
  return `hsk-trainer-backup-${now.toISOString().slice(0, 10)}.json`;
}

export class BackupError extends Error {}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Checks a parsed file is a backup this app can read. Throws BackupError with a readable reason. */
export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupError("This file isn't a backup: it isn't valid JSON.");
  }
  if (!isObj(data) || data.app !== 'hsk-trainer') throw new BackupError("This file isn't an HSK Trainer backup.");
  if (typeof data.version !== 'number' || data.version > BACKUP_VERSION) {
    throw new BackupError('This backup comes from a newer version of the app. Update the app first.');
  }
  const t = data.tables;
  if (!isObj(t)) throw new BackupError('This backup is damaged: no data found.');
  const tables = {
    attempts: t.attempts ?? [],
    writing: t.writing ?? [],
    saved: t.saved ?? [],
    settings: t.settings ?? [],
    exam: t.exam ?? [],
  };
  for (const [name, rows] of Object.entries(tables)) {
    if (!Array.isArray(rows) || !rows.every(isObj)) throw new BackupError(`This backup is damaged: "${name}" isn't a list of records.`);
  }
  const attemptsOk = (tables.attempts as Record<string, unknown>[]).every(
    (a) => typeof a.questionId === 'string' && typeof a.correct === 'boolean' && typeof a.timestamp === 'number',
  );
  const writingOk = (tables.writing as Record<string, unknown>[]).every((w) => typeof w.char === 'string' && typeof w.recalls === 'number');
  if (!attemptsOk || !writingOk) throw new BackupError('This backup is damaged: some records are missing fields.');
  return { app: 'hsk-trainer', version: data.version, exportedAt: String(data.exportedAt ?? ''), tables: tables as Backup['tables'] };
}

/** Replaces all progress with the backup, in one transaction: either everything is restored or nothing changes. */
export async function restoreBackup(backup: Backup): Promise<void> {
  await db.transaction('rw', [db.attempts, db.writing, db.saved, db.settings, db.exam], async () => {
    await Promise.all([db.attempts.clear(), db.writing.clear(), db.saved.clear(), db.settings.clear(), db.exam.clear()]);
    await db.attempts.bulkAdd(backup.tables.attempts);
    await db.writing.bulkPut(backup.tables.writing);
    await db.saved.bulkPut(backup.tables.saved);
    await db.settings.bulkPut(backup.tables.settings);
    await db.exam.bulkPut(backup.tables.exam);
  });
}

export function summariseBackup(b: Backup) {
  const sessions = new Set(b.tables.attempts.map((a) => a.sessionId)).size;
  return {
    answers: b.tables.attempts.length,
    sessions,
    charactersPractised: b.tables.writing.length,
    saved: b.tables.saved.length,
  };
}
