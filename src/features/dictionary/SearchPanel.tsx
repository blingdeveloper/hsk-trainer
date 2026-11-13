import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { href } from '../../lib/router';
import { wordPinyin } from '../../lib/pinyin';
import { useLevel } from '../../lib/useSettings';
import HskTag from './HskTag';
import { definitionText } from './format';
import { searchIndex, type SearchResult } from './search';
import { useDictionary } from './useDictionary';

const PAGE = 20;
// Kept while the app is open, so coming back from an entry shows the same results.
let lastQuery = '';

export default function SearchPanel() {
  const { dict, error } = useDictionary();
  const studying = useLevel();
  const [query, setQuery] = useState(lastQuery);
  const deferred = useDeferredValue(query);
  useEffect(() => {
    lastQuery = query;
  }, [query]);

  const results = useMemo(() => (dict && deferred.trim() ? searchIndex(dict).search(deferred, studying.id) : undefined), [dict, deferred, studying.id]);
  const groups = results
    ? (results.englishFirst ? (['english', 'pinyin'] as const) : (['pinyin', 'english'] as const)).filter((k) => results[k].length > 0)
    : [];

  return (
    <section className="card space-y-3" aria-labelledby="search-title">
      <h2 id="search-title" className="font-display text-lg font-semibold">
        Search by pinyin or English
      </h2>
      <input
        type="search"
        className="min-h-11 w-full rounded-2xl border border-line bg-card px-4 text-ink"
        placeholder="e.g. nihao, xie3, mā, write"
        aria-label="Search by pinyin or English"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        data-testid="search-input"
      />
      <p className="text-sm text-muted">
        Tones are optional: type <span className="font-medium text-ink">ma</span>, <span className="font-medium text-ink">ma3</span> or{' '}
        <span className="font-medium text-ink">mǎ</span>. Use <span className="font-medium text-ink">v</span> for ü (lv = lü). Words in the {studying.name} exam come
        first.
      </p>
      {error && <p className="text-bad">{error}</p>}
      {query.trim() && !dict && !error && <p className="text-muted">Loading dictionary…</p>}
      {results?.direct && (
        <a href={href({ name: 'entry', word: results.direct })} className="btn-secondary" data-testid="search-direct">
          Open <span className="han text-xl" lang="zh-CN">{results.direct}</span>
        </a>
      )}
      {results && !results.direct && groups.length === 0 && (
        <p className="text-muted" data-testid="search-empty">
          {/\p{Script=Han}/u.test(deferred) ? 'Those characters aren’t in the offline dictionary.' : `Nothing found for “${deferred.trim()}”. Check the spelling, or try fewer letters.`}
        </p>
      )}
      {groups.map((g) => (
        <ResultGroup key={`${g}:${deferred}`} kind={g} results={results![g]} />
      ))}
    </section>
  );
}

function ResultGroup({ kind, results }: { kind: 'pinyin' | 'english'; results: SearchResult[] }) {
  const [shown, setShown] = useState(PAGE);
  const label = kind === 'pinyin' ? 'Pinyin matches' : 'English matches';
  return (
    <div className="space-y-2" data-testid={`search-${kind}`}>
      <h3 className="eyebrow">
        {label} <span className="text-muted">({results.length >= 200 ? '200+' : results.length})</span>
      </h3>
      <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2" aria-label={label}>
        {results.slice(0, shown).map((r) => (
          <li key={r.word}>
            <a
              href={href({ name: 'entry', word: r.word })}
              className="block rounded-2xl border border-line px-4 py-3 transition hover:-translate-y-0.5 hover:border-rose/40 hover:bg-blush"
              data-testid="search-result"
            >
              <span className="han text-xl" lang="zh-CN">{r.word}</span> <span className="text-rose">{wordPinyin(r.word, r.entry.pinyin)}</span>{' '}
              <HskTag level={r.level} via={r.via} />
              <span className="block truncate text-sm text-muted">
                {r.entry.definitions
                  .filter((d) => !d.startsWith('CL:'))
                  .slice(0, 3)
                  .map(definitionText)
                  .join('; ')}
              </span>
            </a>
          </li>
        ))}
      </ul>
      {results.length > shown && (
        <button type="button" className="btn-ghost" onClick={() => setShown((n) => n + PAGE)}>
          Show more
        </button>
      )}
    </div>
  );
}
