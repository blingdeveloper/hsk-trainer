import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../src/db/db';
import { backupFileName, BackupError, exportBackup, parseBackup, restoreBackup, summariseBackup } from '../../src/db/backup';

async function seed() {
  await db.attempts.bulkAdd([
    { questionId: 'a-r2-1', sessionId: 's1', paperId: 'set-a', mode: 'guided', answer: 'C', correct: true, timestamp: 1, elapsedMs: 5 },
    { questionId: 'a-r2-2', sessionId: 's1', paperId: 'set-a', mode: 'guided', answer: 'F', correct: false, timestamp: 2, elapsedMs: 9 },
  ]);
  await db.writing.put({ char: '学', recalls: 2, attempts: 3, mistakes: 1, lastPracticed: 3 });
  await db.saved.put({ itemType: 'word', itemRef: '学校', createdAt: 4 });
  await db.settings.put({ id: 'me', targetLevel: 2, syllabusVersion: 'HSK3.0-2025-11', examDate: '2026-12-13', showPinyin: false });
}

describe('backup', () => {
  beforeEach(async () => {
    await Promise.all([db.attempts.clear(), db.writing.clear(), db.saved.clear(), db.settings.clear(), db.exam.clear()]);
  });

  it('round-trips everything through a JSON file', async () => {
    await seed();
    const file = JSON.stringify(await exportBackup(new Date('2026-10-25T10:00:00Z')));
    await Promise.all([db.attempts.clear(), db.writing.clear(), db.saved.clear(), db.settings.clear()]);

    const backup = parseBackup(file);
    expect(summariseBackup(backup)).toEqual({ answers: 2, sessions: 1, charactersPractised: 1, saved: 1 });
    await restoreBackup(backup);

    expect(await db.attempts.count()).toBe(2);
    expect((await db.writing.get('学'))?.recalls).toBe(2);
    expect((await db.settings.get('me'))?.showPinyin).toBe(false);
    expect(await db.saved.count()).toBe(1);
  });

  it('restoring replaces current progress instead of merging', async () => {
    await seed();
    const backup = await exportBackup();
    await db.attempts.add({ questionId: 'extra', sessionId: 's2', mode: 'timed', answer: '', correct: false, timestamp: 9, elapsedMs: 0 });
    await restoreBackup(backup);
    expect(await db.attempts.where('questionId').equals('extra').count()).toBe(0);
  });

  it.each([
    ['not JSON', 'hello', 'valid JSON'],
    ['another app', JSON.stringify({ app: 'other', version: 1, tables: {} }), "isn't an HSK Trainer backup"],
    ['a newer version', JSON.stringify({ app: 'hsk-trainer', version: 99, tables: {} }), 'newer version'],
    ['broken tables', JSON.stringify({ app: 'hsk-trainer', version: 1, tables: { attempts: 'x' } }), 'damaged'],
    ['records missing fields', JSON.stringify({ app: 'hsk-trainer', version: 1, tables: { attempts: [{ foo: 1 }] } }), 'missing fields'],
  ])('rejects %s with a clear message', (_name, text, message) => {
    expect(() => parseBackup(text)).toThrow(BackupError);
    expect(() => parseBackup(text)).toThrow(message);
  });

  it('names files by date', () => {
    expect(backupFileName(new Date('2026-10-25T10:00:00Z'))).toBe('hsk-trainer-backup-2026-10-25.json');
  });
});
