import { db, type SavedItem } from './db';

/** Saved characters and words: kept only on this device (IndexedDB), and included in backups. */
const typeOf = (word: string): SavedItem['itemType'] => ([...word].length === 1 ? 'character' : 'word');

export async function isSaved(word: string): Promise<boolean> {
  return (await db.saved.where({ itemType: typeOf(word), itemRef: word }).count()) > 0;
}

export async function saveWord(word: string): Promise<void> {
  if (await isSaved(word)) return;
  await db.saved.add({ itemType: typeOf(word), itemRef: word, createdAt: Date.now() });
}

export async function unsaveWord(word: string): Promise<void> {
  await db.saved.where({ itemType: typeOf(word), itemRef: word }).delete();
}

/** Newest first. */
export async function listSaved(): Promise<SavedItem[]> {
  return (await db.saved.orderBy('createdAt').reverse().toArray());
}
