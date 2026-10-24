import { useEffect, useState } from 'react';
import { ORIGINAL_LABEL } from '../../content/types';
import { db, type ExamInProgress } from '../../db/db';
import { href } from '../../lib/router';
import ExamRunner, { newExam } from './ExamRunner';
import { summariseMistakes } from './mistakes';
import { findPaper, MOCK_PAPERS, paperTitle, SET_PAPERS, type Paper } from './papers';

interface PastSession {
  sessionId: string;
  title: string;
  mode: string;
  correct: number;
  total: number;
  timestamp: number;
}

async function loadHistory(): Promise<PastSession[]> {
  const attempts = await db.attempts.orderBy('timestamp').reverse().toArray();
  const sessions = new Map<string, PastSession>();
  for (const a of attempts) {
    const s = sessions.get(a.sessionId) ?? {
      sessionId: a.sessionId,
      title: paperTitle(a.paperId, a.questionId),
      mode: a.mode,
      correct: 0,
      total: 0,
      timestamp: a.timestamp,
    };
    s.total++;
    if (a.correct) s.correct++;
    sessions.set(a.sessionId, s);
  }
  return [...sessions.values()].slice(0, 8);
}

type Active = { paper: Paper; saved: ExamInProgress };

export default function ExamView({ autoResume = false }: { autoResume?: boolean }) {
  const [active, setActive] = useState<Active | null>(null);
  const [saved, setSaved] = useState<ExamInProgress | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState<{ paper: Paper; mode: ExamInProgress['mode'] } | null>(null);
  const [setIndex, setSetIndex] = useState(0);
  const [history, setHistory] = useState<PastSession[]>([]);
  const [openMistakes, setOpenMistakes] = useState(0);

  useEffect(() => {
    if (active) return;
    let live = true;
    (async () => {
      const current = (await db.exam.get('current')) ?? null;
      const paper = current && findPaper(current.paperId, current.questionIds);
      if (!live) return;
      if (current && paper && autoResume) {
        location.replace(href({ name: 'practice' }));
        setActive({ paper, saved: current });
        return;
      }
      setSaved(current && paper ? current : null);
      setLoaded(true);
      setHistory(await loadHistory());
      setOpenMistakes(summariseMistakes(await db.attempts.toArray()).filter((m) => m.open).length);
    })();
    return () => {
      live = false;
    };
  }, [active, autoResume]);

  async function start(paper: Paper, mode: ExamInProgress['mode'], confirmed = false) {
    if (saved && !confirmed) {
      setPending({ paper, mode });
      return;
    }
    const exam = newExam(paper, mode);
    await db.exam.put(exam);
    setPending(null);
    setActive({ paper, saved: exam });
  }

  async function discard() {
    await db.exam.delete('current');
    setSaved(null);
  }

  if (active) {
    return <ExamRunner key={active.saved.sessionId} paper={active.paper} saved={active.saved} onExit={() => setActive(null)} />;
  }
  if (!loaded) return <p className="text-muted">Loading…</p>;

  const set = SET_PAPERS[setIndex];
  const savedPaper = saved && findPaper(saved.paperId, saved.questionIds);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">HSK 2 exam practice</h1>
        <p className="mt-1 text-sm">
          <span className="tag">Original practice</span> <span className="text-muted">{ORIGINAL_LABEL}</span>
        </p>
      </header>

      {saved && savedPaper && (
        <section className="card flex flex-wrap items-center gap-3 border-rose" data-testid="resume">
          <div className="flex-1">
            <p className="font-medium">Unfinished: {savedPaper.title}</p>
            <p className="text-sm text-muted">
              {saved.mode === 'timed' ? 'Timed' : 'Guided'} · {Object.keys(saved.answers).length}/{savedPaper.questions.length} answered · saved{' '}
              {new Date(saved.updatedAt).toLocaleString()}
            </p>
          </div>
          <button type="button" className="btn-secondary" onClick={discard}>
            Discard
          </button>
          <button type="button" className="btn-primary" onClick={() => setActive({ paper: savedPaper, saved })}>
            Resume
          </button>
        </section>
      )}

      {pending && (
        <section className="card flex flex-wrap items-center gap-3" role="alertdialog" aria-label="Replace unfinished exam">
          <p className="flex-1 text-sm">
            Starting <strong>{pending.paper.title}</strong> will discard your unfinished {savedPaper?.title}.
          </p>
          <button type="button" className="btn-secondary" onClick={() => setPending(null)}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={() => start(pending.paper, pending.mode, true)}>
            Discard and start
          </button>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Practice sets</h2>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Practice set">
            {SET_PAPERS.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={i === setIndex}
                onClick={() => setSetIndex(i)}
                className={`min-h-11 rounded-xl border px-4 py-2 ${i === setIndex ? 'border-rose bg-blush' : 'border-line bg-card'}`}
              >
                {p.title}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted">
            Reading Parts 2–4 (15 questions) and Writing Parts 1–2 (10). Timed mode scales the official time per question: reading{' '}
            {set.minutes.reading} min, writing {set.minutes.writing} min.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="card text-left hover:bg-blush" onClick={() => start(set, 'guided')}>
              <span className="block font-medium">Guided</span>
              <span className="text-sm text-muted">Check each answer and see the explanation straight away.</span>
            </button>
            <button type="button" className="card text-left hover:bg-blush" onClick={() => start(set, 'timed')}>
              <span className="block font-medium">Timed</span>
              <span className="text-sm text-muted">No feedback until the end. Each section has a timer.</span>
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Full mock exam</h2>
          <p className="text-sm text-muted">
            Same order, part sizes and pace as the official paper: Reading Part 2 (5), Part 3 (10), Part 4 (5) in{' '}
            {MOCK_PAPERS[0].minutes.reading} min, then Writing Parts 1–2 (10) in {MOCK_PAPERS[0].minutes.writing} min. Always timed. You
            can't go back to a finished section.
          </p>
          <p className="text-xs text-muted">
            Not included yet: Listening (25 questions, ~17 min, then 3 min to fill in the answer sheet) and Reading Part 1 (5 picture
            questions). Mocks reuse questions from sets A–C, so you may have seen some.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {MOCK_PAPERS.map((p) => (
              <button key={p.id} type="button" className="card text-left hover:bg-blush" onClick={() => start(p, 'timed')}>
                <span className="block font-medium">{p.title}</span>
                <span className="text-sm text-muted">
                  {p.questions.length} questions · {(p.minutes.reading ?? 0) + (p.minutes.writing ?? 0)} min
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <a href={href({ name: 'mistakes' })} className="card flex items-center justify-between hover:bg-blush">
        <span>
          <span className="block font-medium">My mistakes →</span>
          <span className="text-sm text-muted">Every question you got wrong, with explanations, ready to redo.</span>
        </span>
        <span className="tag" data-testid="open-mistakes">
          {openMistakes} to fix
        </span>
      </a>

      {history.length > 0 && (
        <section className="card">
          <h2 className="font-medium">Recent attempts</h2>
          <ul className="mt-2 space-y-1 text-sm" data-testid="history">
            {history.map((s) => (
              <li key={s.sessionId} className="flex justify-between gap-3">
                <span>
                  {new Date(s.timestamp).toLocaleString()} · {s.title} · {s.mode}
                </span>
                <span>
                  {s.correct}/{s.total}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
