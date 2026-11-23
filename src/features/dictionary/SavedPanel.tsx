import { useEffect, useState } from 'react';
import { href } from '../../lib/router';
import { wordPinyin } from '../../lib/pinyin';
import type { SavedItem } from '../../db/db';
import { listSaved, unsaveWord } from '../../db/saved';
import HskTag from './HskTag';
import { definitionText } from './format';
import { useDictionary } from './useDictionary';

/** The characters and words you saved, newest first. Stored only on this device. */
export default function SavedPanel() {
  const { dict } = useDictionary();
  const [items, setItems] = useState<SavedItem[] | null>(null);

  useEffect(() => {
    listSaved().then(setItems, () => setItems([]));
  }, []);

  async function remove(word: string) {
    await unsaveWord(word);
    setItems((list) => list?.filter((i) => i.itemRef !== word) ?? null);
  }

  if (!items) return null;

  return (
    <section className="card space-y-3" aria-labelledby="saved-title" data-testid="saved-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="saved-title" className="font-display text-lg font-semibold">
          Saved words {items.length > 0 && <span className="text-muted">({items.length})</span>}
        </h2>
        <p className="text-xs text-muted">Kept on this device and included in backups.</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted" data-testid="saved-empty">
          Nothing saved yet. Open any character or word and tap <span className="font-medium text-ink">Save</span> to keep it here.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {items.map((item) => {
            const word = item.itemRef;
            const entry = dict?.lookup(word)[0];
            return (
              <li key={`${item.itemType}:${word}`} className="flex items-stretch gap-2" data-testid="saved-item">
                <a
                  href={href({ name: 'entry', word })}
                  className="block min-w-0 flex-1 rounded-2xl border border-line px-4 py-3 transition hover:border-rose/40 hover:bg-blush"
                >
                  <span className="han text-xl" lang="zh-CN">
                    {word}
                  </span>{' '}
                  {entry && <span className="text-rose">{wordPinyin(word, entry.pinyin)}</span>} {dict && <HskTag level={dict.level(word)} />}
                  {entry && (
                    <span className="block truncate text-sm text-muted">
                      {entry.definitions
                        .filter((d) => !d.startsWith('CL:'))
                        .slice(0, 3)
                        .map(definitionText)
                        .join('; ')}
                    </span>
                  )}
                </a>
                <button type="button" className="btn-ghost shrink-0" onClick={() => remove(word)} aria-label={`Remove ${word} from saved`}>
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
