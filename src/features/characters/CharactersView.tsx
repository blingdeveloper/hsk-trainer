import { useCallback, useEffect, useState } from 'react';
import { db, recordWritingQuiz, RECALLS_TO_LEARN, type WritingProgress } from '../../db/db';
import { assetUrl } from '../../lib/assets';
import { href } from '../../lib/router';
import { useDictionary } from '../dictionary/useDictionary';
import WritingQuiz, { type QuizMode } from './WritingQuiz';
import { useWide } from '../../lib/useWide';

const SESSION_SIZE = 10;

type Status = 'new' | 'practising' | 'learned';

function statusOf(p?: WritingProgress): Status {
  if (!p || p.attempts === 0) return 'new';
  return p.recalls >= RECALLS_TO_LEARN ? 'learned' : 'practising';
}

const STATUS_STYLE: Record<Status, string> = {
  new: 'border-line bg-card',
  practising: 'border-rose/40 bg-blush',
  learned: 'border-good/40 bg-good/10',
};

let charsPromise: Promise<string[]> | undefined;
function loadWritingChars(): Promise<string[]> {
  charsPromise ??= fetch(assetUrl('packs/core/hsk.json'))
    .then((r) => r.json())
    .then((d: { writingChars: Record<string, string[]> }) => d.writingChars['1-2']);
  return charsPromise;
}

/** Next characters to practise: not yet learned, fewest recalls first, then least recently practised. */
export function pickSession(chars: string[], progress: Map<string, WritingProgress>, size = SESSION_SIZE): string[] {
  return chars
    .filter((c) => statusOf(progress.get(c)) !== 'learned')
    .map((c, i) => ({ c, i, p: progress.get(c) }))
    .sort((a, b) => (a.p?.recalls ?? 0) - (b.p?.recalls ?? 0) || (a.p?.lastPracticed ?? 0) - (b.p?.lastPracticed ?? 0) || a.i - b.i)
    .slice(0, size)
    .map((x) => x.c);
}

export default function CharactersView({ char }: { char?: string }) {
  const [chars, setChars] = useState<string[]>([]);
  const [progress, setProgress] = useState(new Map<string, WritingProgress>());
  const [session, setSession] = useState<string[] | null>(null);

  const refresh = useCallback(async () => {
    const rows = await db.writing.toArray();
    setProgress(new Map(rows.map((r) => [r.char, r])));
  }, []);

  useEffect(() => {
    loadWritingChars().then(setChars);
    void refresh();
  }, [refresh]);

  if (session) {
    return <Session queue={session} onExit={() => { setSession(null); void refresh(); }} />;
  }
  if (char) {
    return <CharacterPractice char={char} onRecorded={refresh} progress={progress.get(char)} />;
  }

  const learned = chars.filter((c) => statusOf(progress.get(c)) === 'learned').length;
  const practising = chars.filter((c) => statusOf(progress.get(c)) === 'practising').length;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Writing characters</h1>
        <p className="text-sm text-muted">
          The {chars.length || 100} characters the official HSK 1–2 syllabus says you must be able to write (书写字). A character counts as
          learned after you write it from memory {RECALLS_TO_LEARN} times with at most one mistake.
        </p>
      </header>

      <section className="card space-y-3">
        <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden>
          <div className="h-full bg-good" style={{ width: `${chars.length ? (learned / chars.length) * 100 : 0}%` }} />
        </div>
        <p className="text-sm" data-testid="writing-summary">
          <strong>{learned}</strong> learned · {practising} practising · {chars.length - learned - practising} new
        </p>
        <button
          type="button"
          className="btn-primary"
          disabled={!chars.length || learned === chars.length}
          onClick={() => setSession(pickSession(chars, progress))}
        >
          Practise next {SESSION_SIZE}
        </button>
      </section>

      <ul className="grid grid-cols-6 gap-2 sm:grid-cols-10 lg:gap-3" aria-label="Writing characters">
        {chars.map((c) => {
          const s = statusOf(progress.get(c));
          return (
            <li key={c}>
              <a
                href={href({ name: 'characters', char: c })}
                aria-label={`${c}, ${s}`}
                data-status={s}
                className={`han flex aspect-square items-center justify-center rounded-xl border text-2xl hover:border-rose ${STATUS_STYLE[s]}`}
              >
                {c}
              </a>
            </li>
          );
        })}
      </ul>
      <p className="flex gap-4 text-xs text-muted">
        <span><span className="mr-1 inline-block h-3 w-3 rounded border border-line bg-card align-middle" />New</span>
        <span><span className="mr-1 inline-block h-3 w-3 rounded bg-blush align-middle" />Practising</span>
        <span><span className="mr-1 inline-block h-3 w-3 rounded bg-good/30 align-middle" />Learned</span>
      </p>
    </div>
  );
}

function Gloss({ char }: { char: string }) {
  const { dict } = useDictionary();
  const entry = dict?.lookup(char)[0];
  if (!entry) return <p className="text-muted">…</p>;
  return (
    <p data-testid="char-gloss">
      <span className="text-lg font-medium text-rose">{entry.pinyin}</span>{' '}
      <span className="text-muted">{entry.definitions.slice(0, 3).join('; ')}</span>
    </p>
  );
}

function ModeTabs({ mode, setMode }: { mode: QuizMode; setMode: (m: QuizMode) => void }) {
  const tabs: [QuizMode, string][] = [
    ['watch', 'Watch'],
    ['trace', 'Trace'],
    ['memory', 'From memory'],
  ];
  return (
    <div className="flex gap-1 rounded-xl bg-paper p-1" role="tablist">
      {tabs.map(([m, label]) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={mode === m}
          onClick={() => setMode(m)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm min-h-11 ${mode === m ? 'bg-card font-medium shadow-sm' : 'text-muted'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function quizSize(wide: boolean) {
  return wide ? 360 : Math.min(280, window.innerWidth - 80);
}

function CharacterPractice({ char, progress, onRecorded }: { char: string; progress?: WritingProgress; onRecorded: () => void }) {
  const [mode, setMode] = useState<QuizMode>('watch');
  const wide = useWide();
  const status = statusOf(progress);
  return (
    <div className="space-y-4">
      <a href={href({ name: 'characters' })} className="text-sm text-rose hover:underline">
        ← All writing characters
      </a>
      <section className="card grid items-start gap-6 md:grid-cols-[1fr_auto] md:p-6">
        <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="han text-4xl">{char}</h1>
            <Gloss char={char} />
          </div>
          <div className="text-right text-sm">
            <span className="tag">{status}</span>
            <p className="mt-1 text-muted">
              Recalls: {progress?.recalls ?? 0}/{RECALLS_TO_LEARN}
            </p>
          </div>
        </div>
        <ModeTabs mode={mode} setMode={setMode} />
        <a href={href({ name: 'entry', word: char })} className="hidden text-sm text-rose hover:underline md:block">
          Dictionary entry and words with {char} →
        </a>
        </div>
        <WritingQuiz
          char={char}
          mode={mode}
          size={quizSize(wide)}
          onFinish={async (mistakes) => {
            if (mode === 'watch') return;
            await recordWritingQuiz(char, mode, mistakes);
            onRecorded();
          }}
        />
        <a href={href({ name: 'entry', word: char })} className="block text-sm text-rose hover:underline md:hidden">
          Dictionary entry and words with {char} →
        </a>
      </section>
    </div>
  );
}

function Session({ queue, onExit }: { queue: string[]; onExit: () => void }) {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<QuizMode>('memory');
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<Record<string, number>>({});
  const wide = useWide();
  const char = queue[index];

  if (index >= queue.length) {
    const good = Object.values(results).filter((m) => m <= 1).length;
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Session done</h1>
        <section className="card" data-testid="session-summary">
          <p className="text-3xl font-semibold">
            {good} / {queue.length}
          </p>
          <p className="text-sm text-muted">written from memory with at most one mistake</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {queue.map((c) => (
              <li key={c} className={`han rounded-lg border px-2 py-1 text-xl ${results[c] !== undefined && results[c] <= 1 ? 'border-good/40 bg-good/10' : 'border-bad/30 bg-bad/10'}`}>
                {c}
              </li>
            ))}
          </ul>
        </section>
        <button type="button" className="btn-primary" onClick={onExit}>
          Back to characters
        </button>
      </div>
    );
  }

  function next() {
    setIndex((i) => i + 1);
    setMode('memory');
    setFinished(false);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <p className="font-medium">
          Character {index + 1} / {queue.length}
        </p>
        <button type="button" className="text-sm text-muted hover:underline" onClick={onExit}>
          End session
        </button>
      </header>
      <section className="card grid items-start gap-6 md:grid-cols-[1fr_auto] md:p-6">
        <div className="space-y-4">
        <p className="text-sm text-muted">Write this character from memory. If you're stuck, switch to Watch or Trace, then try again from memory.</p>
        <Gloss char={char} />
        <ModeTabs mode={mode} setMode={(m) => { setMode(m); setFinished(false); }} />
        <button type="button" className="btn-primary hidden w-full md:block" onClick={next} data-testid="session-next-wide">
          {finished ? 'Next →' : 'Skip →'}
        </button>
        </div>
        <WritingQuiz
          key={char}
          char={char}
          mode={mode}
          size={quizSize(wide)}
          onFinish={async (mistakes) => {
            if (mode === 'watch') return;
            await recordWritingQuiz(char, mode, mistakes);
            if (mode === 'memory') {
              setResults((r) => ({ ...r, [char]: mistakes }));
              setFinished(true);
            }
          }}
        />
        <button type="button" className="btn-primary w-full md:hidden" onClick={next} data-testid="session-next">
          {finished ? 'Next →' : 'Skip →'}
        </button>
      </section>
    </div>
  );
}
