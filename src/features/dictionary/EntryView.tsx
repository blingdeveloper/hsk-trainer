import { useEffect, useState } from 'react';
import { href } from '../../lib/router';
import { db } from '../../db/db';
import StrokeOrder from '../strokes/StrokeOrder';
import { useDictionary } from './useDictionary';

function HskTag({ level }: { level?: number }) {
  if (!level) return null;
  return <span className="tag">{level >= 7 ? 'HSK 7–9' : `HSK ${level}`}</span>;
}

export default function EntryView({ word }: { word: string }) {
  const { dict, error } = useDictionary();
  const [saved, setSaved] = useState(false);
  const chars = [...word];
  const isChar = chars.length === 1;

  useEffect(() => {
    db.saved.where({ itemType: isChar ? 'character' : 'word', itemRef: word }).count().then((n) => setSaved(n > 0));
  }, [word, isChar]);

  async function save() {
    await db.saved.put({ itemType: isChar ? 'character' : 'word', itemRef: word, createdAt: Date.now() });
    setSaved(true);
  }

  if (error) return <p className="text-bad">{error}</p>;
  if (!dict) return <p className="text-muted">Loading dictionary…</p>;

  const entries = dict.lookup(word);
  const compounds = isChar ? dict.wordsContaining(word) : [];

  return (
    <div className="space-y-4">
      <a href={href({ name: 'write' })} className="text-sm text-rose underline-offset-2 hover:underline">
        ← Draw another character
      </a>

      <div className="grid items-start gap-4 md:grid-cols-2">
      <section className="card md:p-6">
        <div className="flex flex-wrap items-start gap-5">
          <div className="flex-1 min-w-0">
            <h1 className="han text-5xl leading-tight" data-testid="entry-headword">
              {word}
            </h1>
            {entries[0]?.traditional && (
              <p className="han mt-1 text-muted">
                Traditional: <span className="text-ink">{entries[0].traditional}</span>
              </p>
            )}
            <div className="mt-2 flex gap-2">
              <HskTag level={dict.level(word)} />
            </div>
          </div>
          {isChar && <StrokeOrder char={word} />}
        </div>

        {entries.length === 0 ? (
          <p className="mt-4 text-muted" data-testid="no-entry">
            This isn't in the offline dictionary pack. The pack covers single characters and words made only of HSK 1–3 characters.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {entries.map((e, i) => (
              <li key={i} className="border-t border-line pt-3 first:border-0 first:pt-0">
                <p className="text-lg font-medium text-rose" data-testid="entry-pinyin">
                  {e.pinyin}
                </p>
                <ul className="mt-1 list-disc pl-5 text-ink">
                  {e.definitions.map((d, j) => (
                    <li key={j}>{d}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
        {entries.length > 1 && (
          <p className="mt-3 text-sm text-muted">This has more than one reading. Which one applies depends on the context.</p>
        )}

        <div className="mt-4 flex gap-2">
          <button type="button" className="btn-secondary" onClick={save} disabled={saved}>
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </section>

      {!isChar && (
        <section className="card">
          <h2 className="font-medium">Characters in this word</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {chars.map((c, i) => (
              <li key={i}>
                <a href={href({ name: 'entry', word: c })} className="han inline-flex h-12 w-12 items-center justify-center rounded-xl border border-line text-2xl hover:bg-blush">
                  {c}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isChar && (
        <section className="card">
          <h2 className="font-medium">Words containing {word}</h2>
          <p className="text-sm text-muted">These are all real CC-CEDICT entries. HSK-listed words come first.</p>
          {compounds.length === 0 ? (
            <p className="mt-3 text-muted">No words in the offline pack.</p>
          ) : (
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2" data-testid="compound-list">
              {compounds.map((w) => {
                const first = dict.lookup(w)[0];
                return (
                  <li key={w}>
                    <a href={href({ name: 'entry', word: w })} className="block rounded-xl border border-line px-3 py-2 hover:bg-blush">
                      <span className="han text-xl">{w}</span> <span className="text-rose">{first.pinyin}</span>{' '}
                      <HskTag level={dict.level(w)} />
                      <span className="block truncate text-sm text-muted">{first.definitions.slice(0, 2).join('; ')}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      </div>

      <p className="text-xs text-muted">
        Definitions: CC-CEDICT ({dict.meta.version.slice(0, 10)}), CC BY-SA 4.0. Level tags: HSK 3.0 syllabus (2025-11). Stroke data:
        Make Me a Hanzi / hanzi-writer-data (Arphic Public License).
      </p>
    </div>
  );
}
