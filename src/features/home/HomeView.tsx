import { useEffect, useState } from 'react';
import { db, RECALLS_TO_LEARN } from '../../db/db';
import type { LevelId } from '../../content/types';
import { LEVEL_IDS, LEVELS, type LevelConfig } from '../../content/levels';
import { loadWritingChars } from '../../content/writingChars';
import { useLevel, useSettings } from '../../lib/useSettings';
import { href, type Route } from '../../lib/router';
import { ProgressBar } from '../../ui/Progress';
import { summariseMistakes } from '../exam/mistakes';
import { attemptLevel, findPaper, mockPapers, setPapers } from '../exam/papers';
import { useOfflineState } from '../../lib/updates';

interface Overview {
  resumeTitle?: string;
  openMistakes: number;
  learned: number;
  /** Writing characters for this level (95 for HSK 1, 100 for HSK 2). */
  writingTotal: number;
  practising: number;
  answered: number;
  /** Accuracy over the most recent 50 answers, 0–1. */
  recentAccuracy?: number;
  nextPaper?: { title: string; kind: 'set' | 'mock'; questions: number; minutes: number };
}

async function loadOverview(levelId: LevelId): Promise<Overview> {
  const [exam, allAttempts, allWriting, levelChars] = await Promise.all([
    db.exam.get('current'),
    db.attempts.toArray(),
    db.writing.toArray(),
    loadWritingChars(levelId),
  ]);
  const inLevel = new Set(levelChars);
  const writing = allWriting.filter((w) => inLevel.has(w.char));
  // Each level has its own practice history; the writing characters are shared (HSK 1–2 list).
  const attempts = allAttempts.filter((a) => attemptLevel(a.questionId) === levelId);
  const recent = [...attempts].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
  const tried = new Set(attempts.map((a) => a.paperId ?? `set-${a.questionId.split('-')[0]}`));
  const papers = [...setPapers(levelId), ...mockPapers(levelId)];
  const next = papers.find((p) => !tried.has(p.id)) ?? mockPapers(levelId)[0] ?? papers[0];
  const examPaper = exam ? findPaper(exam.paperId, exam.questionIds) : undefined;
  return {
    resumeTitle: examPaper ? (examPaper.level === levelId ? examPaper.title : `${examPaper.title} (HSK ${examPaper.level})`) : undefined,
    openMistakes: summariseMistakes(attempts).filter((m) => m.open).length,
    learned: writing.filter((w) => w.recalls >= RECALLS_TO_LEARN).length,
    writingTotal: levelChars.length,
    practising: writing.filter((w) => w.attempts > 0 && w.recalls < RECALLS_TO_LEARN).length,
    answered: attempts.length,
    recentAccuracy: recent.length ? recent.filter((a) => a.correct).length / recent.length : undefined,
    nextPaper: next ? { title: next.title, kind: next.kind === 'mock' ? 'mock' : 'set', questions: next.questions.length, minutes: Object.values(next.minutes).reduce((a, b) => a + (b ?? 0), 0) } : undefined,
  };
}

function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 11) return { han: '早上好', pinyin: 'zǎoshang hǎo', en: 'Good morning' };
  if (h < 13) return { han: '中午好', pinyin: 'zhōngwǔ hǎo', en: 'Good afternoon' };
  if (h < 18) return { han: '下午好', pinyin: 'xiàwǔ hǎo', en: 'Good afternoon' };
  return { han: '晚上好', pinyin: 'wǎnshang hǎo', en: 'Good evening' };
}

export function daysUntil(date: string, now = Date.now()) {
  return Math.ceil((new Date(`${date}T00:00:00`).getTime() - now) / 86_400_000);
}

interface Step {
  han: string;
  title: string;
  detail: string;
  route: Route;
  testId: string;
}

function upNext(o: Overview, levelName: string, hasWriting: boolean): Step[] {
  const steps: Step[] = [];
  if (o.resumeTitle) {
    steps.push({ han: '继续', title: `Finish ${o.resumeTitle}`, detail: 'Pick up where you left off.', route: { name: 'practice', resume: true }, testId: 'next-resume' });
  }
  if (o.openMistakes > 0) {
    steps.push({
      han: '改错',
      title: `Fix ${o.openMistakes} mistake${o.openMistakes === 1 ? '' : 's'}`,
      detail: 'Redo the questions you got wrong, with explanations.',
      route: { name: 'mistakes' },
      testId: 'next-mistakes',
    });
  }
  if (o.learned < o.writingTotal) {
    steps.push({
      han: '写字',
      title: 'Write 10 characters',
      detail: hasWriting
        ? `${o.learned} of ${o.writingTotal} exam characters learned so far.`
        : `${o.learned} of ${o.writingTotal} learned. ${levelName} has no writing section, but writing them helps you remember them.`,
      route: { name: 'characters' },
      testId: 'next-characters',
    });
  }
  if (o.nextPaper) {
    steps.push({
      han: o.nextPaper.kind === 'mock' ? '模考' : '练习',
      title: o.nextPaper.kind === 'mock' ? `Sit ${o.nextPaper.title}` : `Try ${o.nextPaper.title}`,
      detail:
        o.nextPaper.kind === 'mock'
          ? `${o.nextPaper.questions} questions, ${o.nextPaper.minutes} minutes, official order.`
          : `${o.nextPaper.questions} questions in the official ${levelName} format.`,
      route: { name: 'practice' },
      testId: 'next-paper',
    });
  }
  // Without a writing section in the exam, the next paper matters more than writing practice.
  if (!hasWriting) {
    const writing = steps.findIndex((s) => s.testId === 'next-characters');
    const paper = steps.findIndex((s) => s.testId === 'next-paper');
    if (writing >= 0 && paper > writing) steps.splice(writing, 0, ...steps.splice(paper, 1));
  }
  return steps.slice(0, 3);
}

export default function HomeView() {
  const [o, setO] = useState<Overview>();
  const lvl = useLevel();
  const [settings] = useSettings();
  useEffect(() => {
    void loadOverview(lvl.id).then(setO);
  }, [lvl.id]);
  const g = greeting();

  if (!o) return <p className="text-muted">Loading…</p>;
  const examDate = settings.examDate;
  const days = examDate ? daysUntil(examDate) : undefined;
  const steps = upNext(o, lvl.name, !!lvl.official.writing);

  return (
    <div className="space-y-8">
      <header className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow">
            <span className="han" lang="zh-CN">
              {g.han}
            </span>{' '}
            · {g.pinyin}
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold md:text-5xl">{g.en}.</h1>
          <p className="mt-2 text-muted">Choose your level, or carry on with what's up next for {lvl.name}.</p>
        </div>
        {days !== undefined && (
          <div className="card flex items-center gap-4 !py-4" data-testid="countdown">
            <span className="flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center rounded-full bg-blush" aria-label={`${days} days until the exam`}>
              <span className="font-display text-2xl font-semibold leading-none">{Math.max(days, 0)}</span>
              <span className="text-[11px] text-muted">days</span>
            </span>
            <div>
              <p className="font-medium">{lvl.name} exam</p>
              <p className="text-sm text-muted">{new Date(`${examDate}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        )}
      </header>

      <section aria-labelledby="levels">
        <h2 id="levels" className="font-display text-xl font-semibold">
          Your level
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {LEVEL_IDS.map((id) => (
            <LevelCard key={id} level={LEVELS[id]} current={id === lvl.id} />
          ))}
        </div>
      </section>

      <section aria-labelledby="up-next">
        <h2 id="up-next" className="font-display text-xl font-semibold">
          Up next for {lvl.name}
        </h2>
        <ol className={`mt-3 grid gap-3 ${['', 'md:grid-cols-1', 'md:grid-cols-2', 'md:grid-cols-3'][steps.length]}`}>
          {steps.map((s, i) => (
            <li key={s.testId}>
              <a href={href(s.route)} className="card-link group flex h-full flex-col gap-3" data-testid={s.testId}>
                <span className="flex items-center justify-between">
                  <span className="han flex h-11 w-11 items-center justify-center rounded-2xl bg-blush text-lg text-rose" lang="zh-CN">
                    {s.han}
                  </span>
                  <span className="text-xs text-muted">Step {i + 1}</span>
                </span>
                <span className="font-medium">{s.title}</span>
                <span className="text-sm text-muted">{s.detail}</span>
                <span className="mt-auto text-sm font-medium text-rose transition group-hover:translate-x-0.5">Start →</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="progress" className="grid gap-3 md:grid-cols-3">
        <h2 id="progress" className="sr-only">
          Your progress
        </h2>
        <div className="card space-y-3">
          <p className="text-sm text-muted">{lvl.name} characters learned</p>
          <p className="font-display text-3xl font-semibold" data-testid="stat-learned">
            {o.learned}
            <span className="text-lg text-muted"> / {o.writingTotal}</span>
          </p>
          <ProgressBar value={o.learned} max={o.writingTotal} label="Characters learned" tone="good" />
          <p className="text-xs text-muted">{o.practising} in progress</p>
        </div>
        <div className="card space-y-3">
          <p className="text-sm text-muted">Recent accuracy</p>
          <p className="font-display text-3xl font-semibold">{o.recentAccuracy === undefined ? '—' : `${Math.round(o.recentAccuracy * 100)}%`}</p>
          <ProgressBar value={Math.round((o.recentAccuracy ?? 0) * 100)} max={100} label="Recent accuracy" />
          <p className="text-xs text-muted">{o.answered ? `Last ${Math.min(o.answered, 50)} answers` : 'Answer some practice questions to see this'}</p>
        </div>
        <a href={href({ name: 'mistakes' })} className="card-link space-y-3">
          <p className="text-sm text-muted">Mistakes to fix</p>
          <p className="font-display text-3xl font-semibold">{o.openMistakes}</p>
          <p className="text-xs text-muted">{o.openMistakes ? 'Open your mistake notebook →' : 'Nothing waiting. Nice work.'}</p>
        </a>
      </section>

      <OfflineStatus />
    </div>
  );
}

interface LevelSummary {
  sets: number;
  mocks: number;
  answered: number;
  learned: number;
  writingTotal: number;
}

async function loadLevelSummary(levelId: LevelId): Promise<LevelSummary> {
  const [attempts, writing, chars] = await Promise.all([db.attempts.toArray(), db.writing.toArray(), loadWritingChars(levelId)]);
  const inLevel = new Set(chars);
  return {
    sets: setPapers(levelId).length,
    mocks: mockPapers(levelId).length,
    answered: attempts.filter((a) => attemptLevel(a.questionId) === levelId).length,
    learned: writing.filter((w) => inLevel.has(w.char) && w.recalls >= RECALLS_TO_LEARN).length,
    writingTotal: chars.length,
  };
}

const LEVEL_ACTIONS: { label: string; han: string; route: Route; hint: string }[] = [
  { label: 'Practice', han: '练', route: { name: 'practice' }, hint: 'Practice sets and mock exams' },
  { label: 'Characters', han: '字', route: { name: 'characters' }, hint: 'Learn to write the characters' },
  { label: 'Lookup', han: '查', route: { name: 'write' }, hint: 'Draw a character to look it up' },
];

/** One level on Home: what it is, your progress, and its three sections. Choosing a section switches level. */
function LevelCard({ level, current }: { level: LevelConfig; current: boolean }) {
  const [, update] = useSettings();
  const [summary, setSummary] = useState<LevelSummary>();
  useEffect(() => {
    void loadLevelSummary(level.id).then(setSummary);
  }, [level.id]);

  function open(route: Route) {
    update({ targetLevel: level.id });
    location.hash = href(route);
  }

  return (
    <article
      className={`card flex flex-col gap-4 transition ${current ? 'border-rose/50 ring-2 ring-rose/20' : ''}`}
      aria-label={`${level.name}${current ? ' (your level)' : ''}`}
      data-testid={`level-card-${level.id}`}
    >
      <header className="flex items-start gap-4">
        <span
          className={`han flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl ${current ? 'bg-rose text-on-rose' : 'bg-blush text-rose'}`}
          lang="zh-CN"
          aria-hidden
        >
          {level.han}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-2xl font-semibold">{level.name}</h3>
            {current && <span className="tag">Your level</span>}
          </div>
          <p className="text-sm text-muted">{level.tagline}</p>
        </div>
      </header>

      <p className="text-sm text-muted" data-testid={`level-summary-${level.id}`}>
        {summary
          ? `${summary.sets} practice sets · ${summary.mocks} mock exams · ${summary.learned}/${summary.writingTotal} characters learned${summary.answered ? ` · ${summary.answered} answers so far` : ''}`
          : '…'}
      </p>

      <div className="grid grid-cols-3 gap-2">
        {LEVEL_ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => open(a.route)}
            aria-label={`${level.name} ${a.label}: ${a.hint}`}
            title={a.hint}
            className="group flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border border-line bg-paper px-2 py-3 text-sm font-medium transition hover:-translate-y-0.5 hover:border-rose/40 hover:bg-blush"
          >
            <span className="han text-xl text-rose" lang="zh-CN" aria-hidden>
              {a.han}
            </span>
            {a.label}
          </button>
        ))}
      </div>
    </article>
  );
}

function OfflineStatus() {
  const state = useOfflineState();
  const ready = state === 'ready' ? true : state === 'unavailable' ? false : undefined;
  return (
    <div className="card flex items-center gap-4" data-testid="offline-status">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${ready ? 'bg-sage text-good' : 'bg-blush text-muted'}`} aria-hidden>
        {ready ? '✓' : ready === false ? '!' : '…'}
      </span>
      <span className="text-sm">
        {ready === undefined && 'Preparing offline use…'}
        {ready === true && (
          <>
            <span className="block font-medium">Ready offline</span>
            <span className="text-muted">Everything works without internet.</span>
          </>
        )}
        {ready === false && "Offline install isn't available in this browser. Open the app in Chrome, Edge or Safari to use it offline."}
      </span>
    </div>
  );
}
