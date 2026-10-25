import { useEffect, useState } from 'react';
import { hasInAppHistory, href } from '../../lib/router';
import { db } from '../../db/db';
import StrokeOrder from '../strokes/StrokeOrder';
import { useDictionary } from './useDictionary';
import type { Dictionary } from './dictionary';
import { definitionText, formatDefinition, type Segment } from './format';
import { wordPinyin } from '../../lib/pinyin';

function HskTag({ level }: { level?: number }) {
  if (!level) return null;
  return <span className="tag">{level >= 7 ? 'HSK 7–9' : `HSK ${level}`}</span>;
}

export default function EntryView({ word: requested }: { word: string }) {
  const { dict, error } = useDictionary();
  if (error) return <p className="text-bad">{error}</p>;
  if (!dict) return <p className="text-muted">Loading dictionary…</p>;
  // Traditional input (學, 電腦) shows the simplified entry, with a note.
  const word = dict.toSimplified(requested) ?? requested;
  return <Entry key={word} dict={dict} word={word} typedTraditional={word !== requested ? requested : undefined} />;
}

function Entry({ dict, word, typedTraditional }: { dict: Dictionary; word: string; typedTraditional?: string }) {
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

  const entries = dict.lookup(word);
  const compounds = isChar ? dict.wordsContaining(word) : [];

  return (
    <div className="space-y-4">
      {hasInAppHistory() ? (
        <button type="button" onClick={() => history.back()} className="btn-ghost -ml-3">
          ← Back
        </button>
      ) : (
        <a href={href({ name: 'write' })} className="btn-ghost -ml-3">
          ← Look up a character
        </a>
      )}

      {typedTraditional && (
        <p className="rounded-2xl bg-blush px-4 py-3 text-sm" data-testid="traditional-note">
          <span className="han text-lg" lang="zh-TW">
            {typedTraditional}
          </span>{' '}
          is the traditional form. HSK uses simplified characters, so this shows{' '}
          <span className="han text-lg" lang="zh-CN">
            {word}
          </span>
          .
        </p>
      )}

      <div className="grid items-start gap-4 md:grid-cols-2">
      <section className="card md:p-6">
        <div className="flex flex-wrap items-start gap-5">
          <div className="flex-1 min-w-0">
            <h1 className="han text-6xl leading-tight" lang="zh-CN" data-testid="entry-headword">
              {word}
            </h1>
            {entries[0]?.traditional && (
              <p className="mt-1 text-muted">
                Traditional:{' '}
                <span className="han text-ink" lang="zh-TW">
                  {entries[0].traditional}
                </span>
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
                <p className="text-xl font-medium text-rose" data-testid="entry-pinyin">
                  {wordPinyin(word, e.pinyin)}
                </p>
                <Definitions definitions={e.definitions} />
              </li>
            ))}
          </ol>
        )}
        {entries.length > 1 && (
          <p className="mt-3 text-sm text-muted">This has more than one reading. Which one applies depends on the context.</p>
        )}

        {entries.length > 0 && (
          <div className="mt-4 flex gap-2">
            <button type="button" className="btn-secondary" onClick={save} disabled={saved}>
              {saved ? '✓ Saved' : 'Save'}
            </button>
          </div>
        )}
      </section>

      {!isChar && (
        <section className="card">
          <h2 className="font-display text-lg font-semibold">Characters in this word</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {chars.map((c, i) => (
              <li key={i}>
                <a href={href({ name: 'entry', word: c })} lang="zh-CN" className="han inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-line text-3xl transition hover:bg-blush">
                  {c}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isChar && (
        <section className="card">
          <h2 className="font-display text-lg font-semibold">Words containing <span className="han" lang="zh-CN">{word}</span></h2>
          <p className="text-sm text-muted">These are all real CC-CEDICT entries. HSK-listed words come first.</p>
          {compounds.length === 0 ? (
            <p className="mt-3 text-muted">No words in the offline pack.</p>
          ) : (
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1" data-testid="compound-list">
              {compounds.map((w) => {
                const first = dict.lookup(w)[0];
                return (
                  <li key={w}>
                    <a href={href({ name: 'entry', word: w })} className="block rounded-2xl border border-line px-4 py-3 transition hover:-translate-y-0.5 hover:border-rose/40 hover:bg-blush">
                      <span className="han text-xl" lang="zh-CN">{w}</span> <span className="text-rose">{wordPinyin(w, first.pinyin)}</span>{' '}
                      <HskTag level={dict.level(w)} />
                      <span className="block truncate text-sm text-muted">{first.definitions.filter((d) => !d.startsWith('CL:')).slice(0, 2).map(definitionText).join('; ')}</span>
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

function SegmentView({ s }: { s: Segment }) {
  if ('text' in s) return <>{s.text}</>;
  return (
    <a href={href({ name: 'entry', word: s.word })} className="whitespace-nowrap text-rose underline-offset-2 hover:underline">
      <span className="han" lang="zh-CN">
        {s.word}
      </span>{' '}
      <span className="text-sm">{s.pinyin}</span>
    </a>
  );
}

/** Meanings as a list, with measure words pulled out onto their own line. */
function Definitions({ definitions }: { definitions: string[] }) {
  const formatted = definitions.map(formatDefinition);
  const meanings = formatted.filter((f) => f.kind === 'meaning');
  const measures = formatted.filter((f) => f.kind === 'measure');
  return (
    <>
      <ul className="mt-1 list-disc pl-5 text-ink">
        {meanings.map((f, j) => (
          <li key={j}>
            {f.segments.map((s, k) => (
              <SegmentView key={k} s={s} />
            ))}
          </li>
        ))}
      </ul>
      {measures.length > 0 && (
        <p className="mt-2 text-sm text-muted" data-testid="measure-words">
          Measure word:{' '}
          {measures.flatMap((f) => f.segments).map((s, k) => (
            <SegmentView key={k} s={s} />
          ))}
        </p>
      )}
    </>
  );
}
