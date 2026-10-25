import { useEffect, useState } from 'react';
import { db, getSettings, RECALLS_TO_LEARN } from '../../db/db';
import { href, type Route } from '../../lib/router';
import { ProgressBar } from '../../ui/Progress';
import { summariseMistakes } from '../exam/mistakes';
import { findPaper, MOCK_PAPERS, SET_PAPERS } from '../exam/papers';
import { useOfflineState } from '../../lib/updates';

const WRITING_TOTAL = 100;

interface Overview {
  examDate?: string;
  resumeTitle?: string;
  openMistakes: number;
  learned: number;
  practising: number;
  answered: number;
  /** Accuracy over the most recent 50 answers, 0–1. */
  recentAccuracy?: number;
  nextPaper?: { title: string; kind: 'set' | 'mock' };
}

async function loadOverview(): Promise<Overview> {
  const [settings, exam, attempts, writing] = await Promise.all([getSettings(), db.exam.get('current'), db.attempts.toArray(), db.writing.toArray()]);
  const recent = [...attempts].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
  const tried = new Set(attempts.map((a) => a.paperId ?? `set-${a.questionId.split('-')[0]}`));
  const next = [...SET_PAPERS, ...MOCK_PAPERS].find((p) => !tried.has(p.id)) ?? MOCK_PAPERS[0];
  return {
    examDate: settings.examDate,
    resumeTitle: exam ? findPaper(exam.paperId, exam.questionIds)?.title : undefined,
    openMistakes: summariseMistakes(attempts).filter((m) => m.open).length,
    learned: writing.filter((w) => w.recalls >= RECALLS_TO_LEARN).length,
    practising: writing.filter((w) => w.attempts > 0 && w.recalls < RECALLS_TO_LEARN).length,
    answered: attempts.length,
    recentAccuracy: recent.length ? recent.filter((a) => a.correct).length / recent.length : undefined,
    nextPaper: { title: next.title, kind: next.kind === 'mock' ? 'mock' : 'set' },
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

function upNext(o: Overview): Step[] {
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
  if (o.learned < WRITING_TOTAL) {
    steps.push({
      han: '写字',
      title: 'Write 10 characters',
      detail: `${o.learned} of ${WRITING_TOTAL} exam characters learned so far.`,
      route: { name: 'characters' },
      testId: 'next-characters',
    });
  }
  if (o.nextPaper) {
    steps.push({
      han: o.nextPaper.kind === 'mock' ? '模考' : '练习',
      title: o.nextPaper.kind === 'mock' ? `Sit ${o.nextPaper.title}` : `Try ${o.nextPaper.title}`,
      detail: o.nextPaper.kind === 'mock' ? '30 questions, 30 minutes, official order.' : '25 questions in the official HSK 2 format.',
      route: { name: 'practice' },
      testId: 'next-paper',
    });
  }
  return steps.slice(0, 3);
}

export default function HomeView() {
  const [o, setO] = useState<Overview>();
  useEffect(() => {
    void loadOverview().then(setO);
  }, []);
  const g = greeting();

  if (!o) return <p className="text-muted">Loading…</p>;
  const days = o.examDate ? daysUntil(o.examDate) : undefined;

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
          <p className="mt-2 text-muted">Here's what to do today for HSK 2.</p>
        </div>
        {days !== undefined && (
          <div className="card flex items-center gap-4 !py-4" data-testid="countdown">
            <span className="flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center rounded-full bg-blush" aria-label={`${days} days until the exam`}>
              <span className="font-display text-2xl font-semibold leading-none">{Math.max(days, 0)}</span>
              <span className="text-[11px] text-muted">days</span>
            </span>
            <div>
              <p className="font-medium">HSK 2 exam</p>
              <p className="text-sm text-muted">{new Date(`${o.examDate}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        )}
      </header>

      <section aria-labelledby="up-next">
        <h2 id="up-next" className="font-display text-xl font-semibold">
          Up next
        </h2>
        <ol className={`mt-3 grid gap-3 ${['', 'md:grid-cols-1', 'md:grid-cols-2', 'md:grid-cols-3'][upNext(o).length]}`}>
          {upNext(o).map((s, i) => (
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
          <p className="text-sm text-muted">Exam characters learned</p>
          <p className="font-display text-3xl font-semibold" data-testid="stat-learned">
            {o.learned}
            <span className="text-lg text-muted"> / {WRITING_TOTAL}</span>
          </p>
          <ProgressBar value={o.learned} max={WRITING_TOTAL} label="Characters learned" tone="good" />
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

      <section className="grid gap-3 sm:grid-cols-2">
        <a href={href({ name: 'write' })} className="card-link flex items-center gap-4">
          <span className="han flex h-12 w-12 items-center justify-center rounded-2xl bg-sage text-xl" lang="zh-CN">
            查
          </span>
          <span>
            <span className="block font-medium">Don't know a character?</span>
            <span className="text-sm text-muted">Draw it to look it up, offline.</span>
          </span>
        </a>
        <OfflineStatus />
      </section>
    </div>
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
