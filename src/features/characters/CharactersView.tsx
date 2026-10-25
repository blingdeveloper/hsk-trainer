import PageHeader from '../../ui/PageHeader';
import { useCallback, useEffect, useState } from 'react';
import { db, recordWritingQuiz, RECALLS_TO_LEARN, type WritingProgress } from '../../db/db';
import { assetUrl } from '../../lib/assets';
import { href } from '../../lib/router';
import { useDictionary } from '../dictionary/useDictionary';
import WritingQuiz, { type QuizMode } from './WritingQuiz';
import { useWide } from '../../lib/useWide';
import { ProgressBar, Ring } from '../../ui/Progress';

const SESSION_SIZE = 10;

type Status = 'new' | 'practising' | 'learned';

function statusOf(p?: WritingProgress): Status {
  if (!p || p.attempts === 0) return 'new';
  return p.recalls >= RECALLS_TO_LEARN ? 'learned' : 'practising';
}

const STATUS_STYLE: Record<Status, string> = {
  new: 'border-line bg-card',
  practising: 'border-rose/30 bg-blush',
  learned: 'border-good/30 bg-sage',
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
      <PageHeader han="汉字 · hànzì" title="Writing characters">
        <p className="text-sm text-muted">
          The {chars.length || 100} characters the official HSK 1–2 syllabus says you must be able to write (书写字). A character counts as
          learned after you write it from memory {RECALLS_TO_LEARN} times with at most one mistake.
        </p>
      </PageHeader>

      <section className="card flex flex-wrap items-center gap-5">
        <Ring value={learned} max={chars.length || 100} size={88} label={`${learned} of ${chars.length} learned`}>
          <span className="font-display text-xl">{learned}</span>
          <span className="block text-[10px] font-normal text-muted">of {chars.length || 100}</span>
        </Ring>
        <div className="min-w-48 flex-1 space-y-1">
          <p className="font-medium">Your writing progress</p>
          <p className="text-sm text-muted" data-testid="writing-summary">
            <strong className="text-ink">{learned}</strong> learned · {practising} practising · {chars.length - learned - practising} new
          </p>
        </div>
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
                lang="zh-CN"
                className={`han flex aspect-square items-center justify-center rounded-2xl border text-2xl shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-rose md:text-3xl ${STATUS_STYLE[s]}`}
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
        <span><span className="mr-1 inline-block h-3 w-3 rounded bg-sage align-middle" />Learned</span>
      </p>
    </div>
  );
}

function Gloss({ char }: { char: string }) {
  const { dict } = useDictionary();
  if (!dict) return <p className="text-muted">…</p>;
  const entry = dict.lookup(char)[0];
  if (!entry) return <p className="text-muted">Not in the offline dictionary.</p>;
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
    <div className="flex gap-1 rounded-full bg-paper p-1" role="tablist">
      {tabs.map(([m, label]) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={mode === m}
          onClick={() => setMode(m)}
          className={`min-h-11 flex-1 rounded-full px-3 py-2 text-sm transition ${mode === m ? 'bg-card font-medium shadow-[var(--shadow-soft)]' : 'text-muted hover:text-ink'}`}
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
            <h1 className="han text-6xl" lang="zh-CN">{char}</h1>
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
        <p className="eyebrow">Session done</p>
        <h1 className="font-display text-3xl font-semibold">
          {good === queue.length ? 'Perfect session.' : good >= queue.length / 2 ? 'Nice work.' : good > 0 ? 'Good start. Keep going.' : 'These need more practice.'}
        </h1>
        <section className="card" data-testid="session-summary">
          <p className="text-3xl font-semibold">
            {good} / {queue.length}
          </p>
          <p className="text-sm text-muted">written from memory with at most one mistake</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {queue.map((c) => (
              <li key={c} lang="zh-CN" className={`han rounded-xl border px-2.5 py-1 text-xl ${results[c] !== undefined && results[c] <= 1 ? 'border-good/40 bg-good/10' : 'border-bad/30 bg-bad/10'}`}>
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
        <div className="flex-1 space-y-2">
          <p className="font-medium">
            Character {index + 1} / {queue.length}
          </p>
          <div className="max-w-xs">
            <ProgressBar value={index} max={queue.length} label="Session progress" />
          </div>
        </div>
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
