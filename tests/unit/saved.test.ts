import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../src/db/db';
import { isSaved, listSaved, saveWord, unsaveWord } from '../../src/db/saved';
import { exportBackup, parseBackup } from '../../src/db/backup';

describe('saved words', () => {
  beforeEach(async () => {
    await db.saved.clear();
  });

  it('saves once, lists newest first, and removes', async () => {
    await saveWord('学');
    await new Promise((r) => setTimeout(r, 5));
    await saveWord('学校');
    await saveWord('学'); // saving again doesn't make a duplicate
    expect((await listSaved()).map((s) => [s.itemType, s.itemRef])).toEqual([
      ['word', '学校'],
      ['character', '学'],
    ]);
    expect(await isSaved('学')).toBe(true);

    await unsaveWord('学');
    expect(await isSaved('学')).toBe(false);
    expect((await listSaved()).map((s) => s.itemRef)).toEqual(['学校']);
  });

  it('saved words go into backups', async () => {
    await saveWord('好');
    const backup = parseBackup(JSON.stringify(await exportBackup()));
    expect(backup.tables.saved.map((s) => s.itemRef)).toEqual(['好']);
  });
});
