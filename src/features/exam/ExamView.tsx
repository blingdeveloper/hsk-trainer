import { useEffect, useState } from 'react';
import { originalLabel } from '../../content/types';
import { useLevel } from '../../lib/useSettings';
import LevelSwitch from '../../ui/LevelSwitch';
import { db, type ExamInProgress } from '../../db/db';
import { href } from '../../lib/router';
import PageHeader from '../../ui/PageHeader';
import ExamRunner, { newExam } from './ExamRunner';
import { summariseMistakes } from './mistakes';
import { attemptLevel, describeSections, findPaper, mockPapers, paperTitle, setPapers, type Paper } from './papers';

interface PastSession {
  sessionId: string;
  title: string;
  mode: string;
  correct: number;
  total: number;
  timestamp: number;
}

async function loadHistory(levelId: number): Promise<PastSession[]> {
  const attempts = await db.attempts.orderBy('timestamp').reverse().toArray();
  const sessions = new Map<string, PastSession>();
  for (const a of attempts) {
    if (attemptLevel(a.questionId) !== levelId) continue;
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
  const lvl = useLevel();
  const sets = setPapers(lvl.id);
  const mocks = mockPapers(lvl.id);

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
      setHistory(await loadHistory(lvl.id));
      const levelAttempts = (await db.attempts.toArray()).filter((a) => attemptLevel(a.questionId) === lvl.id);
      setOpenMistakes(summariseMistakes(levelAttempts).filter((m) => m.open).length);
    })();
    return () => {
      live = false;
    };
  }, [active, autoResume, lvl.id]);

  // Switching level starts again from that level's first set.
  useEffect(() => setSetIndex(0), [lvl.id]);

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

  const set = sets[Math.min(setIndex, sets.length - 1)];
  const savedPaper = saved && findPaper(saved.paperId, saved.questionIds);
  const savedTitle = savedPaper ? (savedPaper.level === lvl.id ? savedPaper.title : `${savedPaper.title} (HSK ${savedPaper.level})`) : '';

  return (
    <div className="space-y-6">
      <PageHeader han="练习 · liànxí" title={`${lvl.name} exam practice`} actions={<LevelSwitch />}>
        <p className="text-sm">
          <span className="tag">Original practice</span> {originalLabel(lvl.id)}
        </p>
        <p className="mt-1 text-sm">
          <strong className="text-ink">Official {lvl.name} paper:</strong> {lvl.formatSummary}
        </p>
      </PageHeader>

      {saved && savedPaper && (
        <section className="card flex flex-wrap items-center gap-4 border-rose/40 bg-blush" data-testid="resume">
          <span className="han flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-lg text-rose" lang="zh-CN" aria-hidden>
            继续
          </span>
          <div className="flex-1">
            <p className="font-medium">Unfinished: {savedTitle}</p>
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
            Starting <strong>{pending.paper.title}</strong> will discard your unfinished {savedTitle}.
          </p>
          <button type="button" className="btn-secondary" onClick={() => setPending(null)}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={() => start(pending.paper, pending.mode, true)}>
            Discard and start
          </button>
        </section>
      )}

      {!set ? (
        <section className="card" data-testid="no-sets">
          <p className="font-medium">{lvl.name} practice sets are on their way.</p>
          <p className="text-sm text-muted">Switch to another level above to practise in the meantime.</p>
        </section>
      ) : (
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card space-y-4">
          <h2 className="font-display text-xl font-semibold">Practice sets</h2>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Practice set">
            {sets.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={i === setIndex}
                onClick={() => setSetIndex(i)}
                className={`choice text-sm ${i === setIndex ? 'border-rose bg-rose text-on-rose' : 'border-line bg-card hover:bg-blush'}`}
              >
                {p.title}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted" data-testid="set-summary">
            {describeSections(set)
              .map((d) => d.text)
              .join('; ')}
            . Timed mode uses the official time per question.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="rounded-2xl border border-line p-4 text-left transition hover:-translate-y-0.5 hover:border-rose/40 hover:bg-blush" onClick={() => start(set, 'guided')}>
              <span className="block font-medium">Guided</span>
              <span className="text-sm text-muted">Check each answer and see the explanation straight away.</span>
            </button>
            <button type="button" className="rounded-2xl border border-line p-4 text-left transition hover:-translate-y-0.5 hover:border-rose/40 hover:bg-blush" onClick={() => start(set, 'timed')}>
              <span className="block font-medium">Timed</span>
              <span className="text-sm text-muted">No feedback until the end. Each section has a timer.</span>
            </button>
          </div>
        </section>

        {mocks.length > 0 && (
        <section className="card space-y-4">
          <h2 className="font-display text-xl font-semibold">Full mock exam</h2>
          <p className="text-sm text-muted" data-testid="mock-summary">
            Same order, part sizes and pace as the official paper:{' '}
            {describeSections(mocks[0])
              .map((d) => d.text)
              .join(', then ')}
            . Always timed. You can't go back to a finished section.
          </p>
          <p className="text-xs text-muted">
            Not included yet: {lvl.notIncluded}. Mocks reuse questions from the practice sets, so you may have seen some.
          </p>
          <ul className="space-y-2">
            {mocks.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3 text-left transition hover:border-rose/40 hover:bg-blush"
                  onClick={() => start(p, 'timed')}
                >
                  <span className="whitespace-nowrap font-medium">{p.title}</span>
                  <span className="text-sm text-muted">
                    {p.questions.length} questions · {(p.minutes.reading ?? 0) + (p.minutes.writing ?? 0)} min →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        )}
      </div>
      )}

      <a href={href({ name: 'mistakes' })} className="card-link flex items-center gap-4">
        <span className="han flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blush text-lg text-rose" lang="zh-CN" aria-hidden>
          改错
        </span>
        <span className="flex-1">
          <span className="block font-medium">My mistakes →</span>
          <span className="text-sm text-muted">Every question you got wrong, with explanations, ready to redo.</span>
        </span>
        <span className="tag" data-testid="open-mistakes">
          {openMistakes} to fix
        </span>
      </a>

      {history.length > 0 && (
        <section className="card">
          <h2 className="font-display text-lg font-semibold">Recent attempts</h2>
          <ul className="mt-3 divide-y divide-line text-sm" data-testid="history">
            {history.map((s) => (
              <li key={s.sessionId} className="flex justify-between gap-3 py-2">
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
