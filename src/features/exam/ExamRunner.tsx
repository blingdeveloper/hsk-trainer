import { useCallback, useEffect, useRef, useState } from 'react';
import type { Question, Skill } from '../../content/types';
import { db, type ExamInProgress } from '../../db/db';
import { href } from '../../lib/router';
import type { Paper } from './papers';
import { SectionBody } from './QuestionViews';
import { formatClock, isCorrect, scoreSections, type Answers } from './scoring';
import { useSettings } from '../../lib/useSettings';
import { ProgressBar, Ring } from '../../ui/Progress';
import Switch from '../../ui/Switch';

export const SECTION_LABEL: Record<Skill, string> = { reading: 'Reading 阅读', writing: 'Writing 书写' };

function sectionQuestions(paper: Paper, index: number) {
  return paper.questions.filter((q) => q.skill === paper.sections[index]);
}

/** A fresh saved state for starting a paper. */
export function newExam(paper: Paper, mode: ExamInProgress['mode']): ExamInProgress {
  return {
    id: 'current',
    paperId: paper.id,
    questionIds: paper.kind === 'mistakes' ? paper.questions.map((q) => q.id) : undefined,
    mode,
    sessionId: crypto.randomUUID(),
    startedAt: Date.now(),
    sectionIndex: 0,
    answers: {},
    locked: [],
    remainingMs: mode === 'timed' ? (paper.minutes[paper.sections[0]] ?? 0) * 60_000 : undefined,
    updatedAt: Date.now(),
  };
}

/**
 * Runs one paper section by section. Every change is saved to IndexedDB, so leaving
 * the page or reloading keeps your answers. In timed mode the timer pauses while
 * you're away (the real exam doesn't).
 */
export default function ExamRunner({ paper, saved, onExit }: { paper: Paper; saved: ExamInProgress; onExit: () => void }) {
  const { mode } = saved;
  const [answers, setAnswers] = useState<Answers>(saved.answers);
  const [locked, setLocked] = useState(() => new Set(saved.locked));
  const [sectionIndex, setSectionIndex] = useState(saved.sectionIndex);
  const [confirming, setConfirming] = useState(false);
  const [settings, updateSettings] = useSettings();
  const remaining = useRef(saved.remainingMs ?? 0);
  const submitted = useRef(new Set<number>());
  const checking = useRef(new Set<string>());
  const finished = sectionIndex >= paper.sections.length;

  const persist = useCallback(async () => {
    if (finished) {
      await db.exam.delete('current');
      return;
    }
    await db.exam.put({
      ...saved,
      sectionIndex,
      answers,
      locked: [...locked],
      remainingMs: mode === 'timed' ? remaining.current : undefined,
      updatedAt: Date.now(),
    });
  }, [saved, sectionIndex, answers, locked, mode, finished]);

  // Save on every change…
  useEffect(() => {
    void persist();
  }, [persist]);

  // …and keep the timer's remaining time saved while it runs, when the tab is hidden and on leaving.
  useEffect(() => {
    if (mode !== 'timed' || finished) return;
    // Every second: a save started while the page unloads may not finish, so don't rely on that one.
    const t = setInterval(() => void persist(), 1000);
    const onHide = () => void persist();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
      void persist();
    };
  }, [persist, mode, finished]);

  const record = useCallback(
    async (qs: Question[], current: Answers) => {
      const now = Date.now();
      await db.attempts.bulkAdd(
        qs.map((q) => ({
          questionId: q.id,
          sessionId: saved.sessionId,
          paperId: paper.id,
          mode,
          answer: current[q.id] ?? '',
          correct: isCorrect(q, current[q.id]),
          timestamp: now,
          elapsedMs: now - saved.startedAt,
        })),
      );
    },
    [saved.sessionId, saved.startedAt, paper.id, mode],
  );

  /** Guided mode: lock and save a single question. Ignores repeat clicks. */
  async function check(q: Question) {
    if (locked.has(q.id) || checking.current.has(q.id) || !answers[q.id]) return;
    checking.current.add(q.id);
    setLocked((prev) => new Set(prev).add(q.id));
    await record([q], answers);
  }

  /**
   * Ends a section. Without `force`, asks first if questions are unanswered.
   * Safe against double clicks and the timer firing at the same moment.
   */
  const submitSection = useCallback(
    async (index: number, force = false) => {
      const qs = sectionQuestions(paper, index);
      const unanswered = qs.filter((q) => !answers[q.id] && !locked.has(q.id)).length;
      if (!force && unanswered > 0) {
        setConfirming(true);
        return;
      }
      if (submitted.current.has(index)) return;
      submitted.current.add(index);
      setConfirming(false);
      const toSave = qs.filter((q) => !locked.has(q.id));
      setLocked((prev) => {
        const next = new Set(prev);
        toSave.forEach((q) => next.add(q.id));
        return next;
      });
      if (toSave.length) await record(toSave, answers);
      const nextSkill = paper.sections[index + 1];
      remaining.current = nextSkill ? (paper.minutes[nextSkill] ?? 0) * 60_000 : 0;
      setSectionIndex(index + 1);
      window.scrollTo(0, 0);
    },
    [paper, answers, locked, record],
  );

  if (finished) {
    const scores = scoreSections(paper.questions, answers);
    const correct = scores.reduce((n, s) => n + s.correct, 0);
    const wrong = paper.questions.length - correct;
    return (
      <div className="space-y-4">
        <p className="eyebrow">Review</p>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">{paper.title}</h1>
        <section className="card flex flex-wrap items-center gap-6" data-testid="score">
          <Ring value={correct} max={paper.questions.length} size={104} label={`${correct} of ${paper.questions.length} correct`}>
            <span className="font-display text-2xl">{Math.round((correct / paper.questions.length) * 100)}%</span>
          </Ring>
          <div className="min-w-48 flex-1 space-y-3">
            <p className="font-display text-3xl font-semibold">
              {correct} / {paper.questions.length}
            </p>
            {scores.map((s) => (
              <div key={s.skill} className="space-y-1">
                <p className="flex justify-between text-sm">
                  <span>{SECTION_LABEL[s.skill]}</span>
                  <span className="text-muted">
                    {s.correct}/{s.total}
                  </span>
                </p>
                <ProgressBar value={s.correct} max={s.total} label={`${SECTION_LABEL[s.skill]} score`} tone="good" />
              </div>
            ))}
            <p className="text-xs text-muted">Raw score on original practice questions. This doesn't predict your official result.</p>
          </div>
        </section>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={onExit}>
            Back to practice
          </button>
          {wrong > 0 && (
            <a className="btn-secondary" href={href({ name: 'mistakes' })}>
              Go to my mistakes ({wrong})
            </a>
          )}
        </div>
        {paper.sections.map((skill) => (
          <SectionBody key={skill} paper={paper} skill={skill} answers={answers} locked={new Set(paper.questions.map((q) => q.id))} showFeedback />
        ))}
      </div>
    );
  }

  const skill = paper.sections[sectionIndex];
  const qs = sectionQuestions(paper, sectionIndex);
  const answeredCount = qs.filter((q) => answers[q.id]).length;
  const unanswered = qs.length - answeredCount;
  const isLast = sectionIndex + 1 >= paper.sections.length;

  return (
    <div className="space-y-4">
      <header className="sticky top-0 z-10 -mx-4 space-y-2 border-b border-line bg-paper/90 px-4 pb-3 pt-3 backdrop-blur md:mx-0 md:rounded-b-3xl md:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold">{SECTION_LABEL[skill]}</p>
            <p className="truncate text-xs text-muted">
              {paper.title} · {answeredCount}/{qs.length} answered · {mode === 'timed' ? 'Timed' : 'Guided'} ·{' '}
              <span className="text-rose">Original practice</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Switch checked={settings.showPinyin} onChange={(v) => updateSettings({ showPinyin: v })} label="Pinyin" />
        {mode === 'timed' && (
          <SectionTimer
            key={sectionIndex}
            initialMs={remaining.current}
            onTick={(ms) => (remaining.current = ms)}
            onExpire={() => submitSection(sectionIndex, true)}
          />
        )}
          </div>
        </div>
        <ProgressBar value={answeredCount} max={qs.length} label="Questions answered in this section" />
      </header>

      <SectionBody
        paper={paper}
        skill={skill}
        answers={answers}
        locked={locked}
        showFeedback={mode === 'guided'}
        showPinyin={settings.showPinyin}
        onAnswer={(id, value) => {
          if (locked.has(id)) return;
          setConfirming(false);
          setAnswers((a) => ({ ...a, [id]: value }));
        }}
        onCheck={mode === 'guided' ? check : undefined}
      />

      {confirming ? (
        <div className="card flex flex-wrap items-center gap-3 border-rose" role="alertdialog" aria-label="Unanswered questions">
          <p className="flex-1 text-sm" data-testid="confirm-finish">
            <strong>
              {unanswered} question{unanswered === 1 ? '' : 's'} unanswered.
            </strong>{' '}
            {isLast ? 'Finish the exam anyway?' : `Finish this section anyway? You can't come back to it.`}
          </p>
          <button type="button" className="btn-secondary" onClick={() => setConfirming(false)}>
            Keep working
          </button>
          <button type="button" className="btn-primary" onClick={() => submitSection(sectionIndex, true)} data-testid="confirm-submit">
            Finish anyway
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => submitSection(sectionIndex)} data-testid="submit-section">
            {isLast ? 'Finish and review' : `Finish section → ${SECTION_LABEL[paper.sections[sectionIndex + 1]]}`}
          </button>
          <button type="button" className="text-sm text-muted hover:underline" onClick={onExit}>
            Save and leave
          </button>
        </div>
      )}
    </div>
  );
}

function SectionTimer({ initialMs, onTick, onExpire }: { initialMs: number; onTick: (ms: number) => void; onExpire: () => void }) {
  const [left, setLeft] = useState(initialMs);
  const deadline = useRef(Date.now() + initialMs);
  const fired = useRef(false);
  const expire = useRef(onExpire);
  expire.current = onExpire;
  const tick = useRef(onTick);
  tick.current = onTick;

  useEffect(() => {
    const step = () => {
      const ms = Math.max(0, deadline.current - Date.now());
      setLeft(ms);
      tick.current(ms);
      if (ms <= 0 && !fired.current) {
        fired.current = true;
        expire.current();
      }
    };
    step();
    const t = setInterval(step, 500);
    return () => clearInterval(t);
  }, []);

  return (
    <p
      className={`rounded-full px-3 py-1 font-mono text-lg tabular-nums ${left < 60_000 ? 'bg-bad/10 text-bad' : 'bg-blush'}`}
      role="timer"
      aria-label="Time left in this section"
    >
      {formatClock(left)}
    </p>
  );
}
