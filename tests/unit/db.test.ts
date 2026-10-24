import { describe, expect, it } from 'vitest';
import { AppDB } from '../../src/db/db';

describe('local database', () => {
  it('keeps attempts after the database is closed and reopened', async () => {
    const name = `test-${Math.random()}`;
    const first = new AppDB(name);
    await first.attempts.add({ questionId: 'q1', sessionId: 's1', mode: 'guided', answer: 'A', correct: true, timestamp: 1, elapsedMs: 10 });
    first.close();

    const second = new AppDB(name);
    const rows = await second.attempts.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ questionId: 'q1', correct: true });
    second.close();
  });

  it('does not save the same item twice', async () => {
    const db = new AppDB(`test-${Math.random()}`);
    await db.saved.put({ itemType: 'character', itemRef: '学', createdAt: 1 });
    await expect(db.saved.add({ itemType: 'character', itemRef: '学', createdAt: 2 })).rejects.toThrow();
    db.close();
  });
});
