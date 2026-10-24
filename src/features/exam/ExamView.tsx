import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  OFFICIAL_SECTIONS,
  ORIGINAL_LABEL,
  type Option,
  type PracticeSet,
  type Question,
  type QuestionGroup,
  type Skill,
} from '../../content/types';
import { SETS } from '../../content/sets';
import { db } from '../../db/db';
import HandwritingPad from '../handwriting/HandwritingPad';
import { formatClock, isCorrect, scaledMinutes, scoreSections, type Answers } from './scoring';

type Mode = 'guided' | 'timed';
type Phase = { kind: 'start' } | { kind: 'section'; index: number } | { kind: 'review' };

const SECTIONS: Skill[] = ['reading', 'writing'];
const SECTION_LABEL: Record<Skill, string> = { reading: 'Reading 阅读', writing: 'Writing 书写' };

function questionsFor(set: PracticeSet, skill: Skill) {
  return set.questions.filter((q) => q.skill === skill);
}

function sectionMinutes(set: PracticeSet, skill: Skill) {
  return scaledMinutes(questionsFor(set, skill).length, OFFICIAL_SECTIONS[skill]);
}

/** Question ids start with the set id ("b-r2-1"). */
function setTitleFor(questionId: string) {
  return SETS.find((s) => questionId.startsWith(`${s.id}-`))?.title ?? 'Practice';
}

interface PastSession {
  sessionId: string;
  setTitle: string;
  mode: string;
  correct: number;
  total: number;
  timestamp: number;
}

async function loadHistory(): Promise<PastSession[]> {
  const attempts = await db.attempts.orderBy('timestamp').reverse().toArray();
  const sessions = new Map<string, PastSession>();
  for (const a of attempts) {
    const s = sessions.get(a.sessionId) ?? { sessionId: a.sessionId, setTitle: setTitleFor(a.questionId), mode: a.mode, correct: 0, total: 0, timestamp: a.timestamp };
    s.total++;
    if (a.correct) s.correct++;
    sessions.set(a.sessionId, s);
  }
  return [...sessions.values()].slice(0, 5);
}

export default function ExamView() {
  const [set, setSet] = useState<PracticeSet>(SETS[0]);
  const [mode, setMode] = useState<Mode>('guided');
  const [phase, setPhase] = useState<Phase>({ kind: 'start' });
  const [answers, setAnswers] = useState<Answers>({});
  /** Questions whose answers are locked: checked (guided) or submitted with their section. */
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [sessionId, setSessionId] = useState('');
  const [history, setHistory] = useState<PastSession[]>([]);
  const startedAt = useRef(0);
  const submittedSections = useRef(new Set<number>());
  const checking = useRef(new Set<string>());

  useEffect(() => {
    if (phase.kind === 'start') loadHistory().then(setHistory);
  }, [phase.kind]);

  function start(m: Mode) {
    setMode(m);
    setAnswers({});
    setLocked(new Set());
    submittedSections.current = new Set();
    checking.current = new Set();
    setSessionId(crypto.randomUUID());
    startedAt.current = Date.now();
    setPhase({ kind: 'section', index: 0 });
  }

  const record = useCallback(
    async (qs: Question[], current: Answers) => {
      const now = Date.now();
      await db.attempts.bulkAdd(
        qs.map((q) => ({
          questionId: q.id,
          sessionId,
          mode,
          answer: current[q.id] ?? '',
          correct: isCorrect(q, current[q.id]),
          timestamp: now,
          elapsedMs: now - startedAt.current,
        })),
      );
    },
    [sessionId, mode],
  );

  /** Guided mode: lock and save a single question. Ignores repeat clicks. */
  async function check(q: Question) {
    if (locked.has(q.id) || checking.current.has(q.id) || !answers[q.id]) return;
    checking.current.add(q.id);
    setLocked((prev) => new Set(prev).add(q.id));
    await record([q], answers);
  }

  /** Ends a section: locks every unanswered question, saves them, then moves on. Safe to call twice. */
  const submitSection = useCallback(
    async (index: number) => {
      // A fast double-click or the timer firing right after a click must not save twice.
      if (submittedSections.current.has(index)) return;
      submittedSections.current.add(index);
      const qs = questionsFor(set, SECTIONS[index]).filter((q) => !locked.has(q.id));
      setLocked((prev) => {
        const next = new Set(prev);
        qs.forEach((q) => next.add(q.id));
        return next;
      });
      if (qs.length) await record(qs, answers);
      setPhase(index + 1 < SECTIONS.length ? { kind: 'section', index: index + 1 } : { kind: 'review' });
      window.scrollTo(0, 0);
    },
    [set, locked, answers, record],
  );

  if (phase.kind === 'start') {
    return (
      <div className="space-y-4">
        <header>
          <h1 className="text-2xl font-semibold">HSK 2 exam practice</h1>
          <p className="mt-1 text-sm">
            <span className="tag">Original practice</span> <span className="text-muted">{ORIGINAL_LABEL}</span>
          </p>
        </header>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Practice set">
          {SETS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={s.id === set.id}
              onClick={() => setSet(s)}
              className={`rounded-xl border px-4 py-2 min-h-11 ${s.id === set.id ? 'border-rose bg-blush' : 'border-line bg-card'}`}
            >
              {s.title}
            </button>
          ))}
        </div>
        <section className="card space-y-2 text-sm">
          <p>
            <strong>Official HSK 3.0 Level 2 format</strong> (from the CTI sample paper): Listening 25 questions (~17 min), Reading 25 (25 min),
            Writing 10 (10 min). About 60 minutes in total.
          </p>
          <p className="text-muted">
            This set has Reading Parts 2–4 ({questionsFor(set, 'reading').length} questions) and Writing Parts 1–2 ({questionsFor(set, 'writing').length}{' '}
            questions). Listening and Reading Part 1 need audio or pictures, which aren't licensed yet. Timed mode scales the official
            time per question: reading {sectionMinutes(set, 'reading')} min, writing {sectionMinutes(set, 'writing')} min.
          </p>
          <p className="text-muted">Scores are raw counts. CTI hasn't published the scaled scores or pass mark for the new HSK 2.</p>
        </section>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" className="card text-left hover:bg-blush" onClick={() => start('guided')}>
            <span className="block font-medium">Guided</span>
            <span className="text-sm text-muted">Check each answer and see the explanation straight away.</span>
          </button>
          <button type="button" className="card text-left hover:bg-blush" onClick={() => start('timed')}>
            <span className="block font-medium">Timed exam</span>
            <span className="text-sm text-muted">Exam conditions: no feedback until the end, and each section has a timer.</span>
          </button>
        </div>
        {history.length > 0 && (
          <section className="card">
            <h2 className="font-medium">Recent attempts</h2>
            <ul className="mt-2 space-y-1 text-sm" data-testid="history">
              {history.map((s) => (
                <li key={s.sessionId} className="flex justify-between">
                  <span>
                    {new Date(s.timestamp).toLocaleString()} · {s.setTitle} · {s.mode}
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

  if (phase.kind === 'review') {
    const scores = scoreSections(set.questions, answers);
    const correct = scores.reduce((n, s) => n + s.correct, 0);
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Review</h1>
        <section className="card" data-testid="score">
          <p className="text-3xl font-semibold">
            {correct} / {set.questions.length}
          </p>
          <ul className="mt-2 text-sm text-muted">
            {scores.map((s) => (
              <li key={s.skill}>
                {SECTION_LABEL[s.skill]}: {s.correct}/{s.total}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Raw score on original practice questions. This doesn't predict your official result.</p>
        </section>
        {SECTIONS.map((skill) => (
          <SectionBody key={skill} set={set} skill={skill} answers={answers} locked={new Set(set.questions.map((q) => q.id))} showFeedback />
        ))}
        <button type="button" className="btn-primary" onClick={() => setPhase({ kind: 'start' })}>
          Back to start
        </button>
      </div>
    );
  }

  const skill = SECTIONS[phase.index];
  const qs = questionsFor(set, skill);
  const answeredCount = qs.filter((q) => answers[q.id]).length;

  return (
    <div className="space-y-4">
      <header className="sticky top-0 z-10 -mx-4 flex items-center justify-between border-b border-line bg-paper/95 px-4 py-2 backdrop-blur">
        <div>
          <p className="font-medium">{SECTION_LABEL[skill]}</p>
          <p className="text-xs text-muted">
            {set.title} · {answeredCount}/{qs.length} answered · {mode === 'timed' ? 'Timed exam' : 'Guided'} · <span className="text-rose">Original practice</span>
          </p>
        </div>
        {mode === 'timed' && (
          <SectionTimer key={skill} minutes={sectionMinutes(set, skill)} onExpire={() => submitSection(phase.index)} />
        )}
      </header>

      <SectionBody
        set={set}
        skill={skill}
        answers={answers}
        locked={locked}
        showFeedback={mode === 'guided'}
        onAnswer={(id, value) => !locked.has(id) && setAnswers((a) => ({ ...a, [id]: value }))}
        onCheck={mode === 'guided' ? check : undefined}
      />

      <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => submitSection(phase.index)} data-testid="submit-section">
        {phase.index + 1 < SECTIONS.length ? 'Finish section → Writing' : 'Finish and review'}
      </button>
    </div>
  );
}

function SectionTimer({ minutes, onExpire }: { minutes: number; onExpire: () => void }) {
  const deadline = useMemo(() => Date.now() + minutes * 60_000, [minutes]);
  const [left, setLeft] = useState(minutes * 60_000);
  const fired = useRef(false);
  useEffect(() => {
    const t = setInterval(() => {
      const remaining = deadline - Date.now();
      setLeft(remaining);
      if (remaining <= 0 && !fired.current) {
        fired.current = true;
        onExpire();
      }
    }, 500);
    return () => clearInterval(t);
  }, [deadline, onExpire]);
  return (
    <p className={`font-mono text-lg ${left < 60_000 ? 'text-bad' : ''}`} role="timer" aria-label="Time left in this section">
      {formatClock(left)}
    </p>
  );
}

interface SectionProps {
  set: PracticeSet;
  skill: Skill;
  answers: Answers;
  locked: Set<string>;
  showFeedback: boolean;
  onAnswer?: (questionId: string, value: string) => void;
  onCheck?: (q: Question) => void;
}

function SectionBody({ set, skill, answers, locked, showFeedback, onAnswer, onCheck }: SectionProps) {
  const groups = set.groups.filter((g) => g.skill === skill);
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <GroupBlock key={g.id} group={g} {...{ set, answers, locked, showFeedback, onAnswer, onCheck }} />
      ))}
    </div>
  );
}

function GroupBlock({ group, ...rest }: Omit<SectionProps, 'skill'> & { group: QuestionGroup }) {
  const qs = rest.set.questions.filter((q) => q.groupId === group.id);
  return (
    <section className="card space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">{group.officialPart}</p>
        <p className="text-sm">{group.instructions}</p>
      </div>
      {group.options && (
        <ul className="grid grid-cols-1 gap-x-4 gap-y-1 rounded-xl bg-paper p-3 sm:grid-cols-2">
          {group.options.map((o) => (
            <li key={o.key} className="han">
              <span className="font-sans font-semibold">{o.key}</span> {o.text}{' '}
              {o.pinyin && <span className="font-sans text-sm text-muted">{o.pinyin}</span>}
            </li>
          ))}
        </ul>
      )}
      <ol className="space-y-4">
        {qs.map((q, i) => (
          <QuestionItem key={q.id} number={i + 1} q={q} options={q.options ?? group.options ?? []} {...rest} />
        ))}
      </ol>
    </section>
  );
}

function QuestionItem({
  q,
  number,
  options,
  answers,
  locked,
  showFeedback,
  onAnswer,
  onCheck,
}: Omit<SectionProps, 'skill'> & { q: Question; number: number; options: Option[] }) {
  const [drawing, setDrawing] = useState(false);
  const answer = answers[q.id];
  const isLocked = locked.has(q.id);
  const reveal = showFeedback && isLocked;
  const correct = isCorrect(q, answer);

  return (
    <li className="border-t border-line pt-4 first:border-0 first:pt-0" data-testid={`q-${q.id}`}>
      <div className="flex gap-2">
        <span className="font-semibold text-muted">{number}.</span>
        <div className="flex-1 space-y-2">
          {q.component ? (
            <p className="han text-2xl">
              {[...q.component.word].map((c, i) =>
                i === q.component!.index ? (
                  <span key={i} className="mx-0.5 inline-block rounded border border-dashed border-rose px-1 text-muted">
                    ？{q.component!.shown}
                  </span>
                ) : (
                  <span key={i}>{c}</span>
                ),
              )}{' '}
              <span className="font-sans text-base text-muted">{q.component.pinyin}</span>
            </p>
          ) : (
            <>
              {q.pinyin && <p className="text-sm text-muted">{q.pinyin}</p>}
              <p className="han text-xl">{q.prompt}</p>
              {q.question && <p className="han text-lg">{q.question}</p>}
            </>
          )}

          {q.taskType === 'writing-2-character' ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  aria-label={`Answer for question ${number}`}
                  className="han h-12 w-16 rounded-xl border border-line bg-card text-center text-2xl"
                  value={answer ?? ''}
                  maxLength={2}
                  disabled={isLocked}
                  onChange={(e) => onAnswer?.(q.id, [...e.target.value.trim()].slice(-1).join(''))}
                />
                {!isLocked && (
                  <button type="button" className="btn-secondary text-sm" onClick={() => setDrawing((d) => !d)}>
                    {drawing ? 'Hide pad' : '✍ Draw it'}
                  </button>
                )}
              </div>
              {drawing && !isLocked && (
                <HandwritingPad
                  size={220}
                  clearOnPick
                  onPick={(c) => {
                    onAnswer?.(q.id, c);
                    setDrawing(false);
                  }}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Options for question ${number}`}>
              {options.map((o) => {
                const chosen = answer === o.key;
                const state = reveal && o.key === q.correctAnswer ? 'border-good bg-good/10' : reveal && chosen ? 'border-bad bg-bad/10' : chosen ? 'border-rose bg-blush' : 'border-line bg-card';
                return (
                  <button
                    key={o.key}
                    type="button"
                    role="radio"
                    aria-checked={chosen}
                    disabled={isLocked}
                    onClick={() => onAnswer?.(q.id, o.key)}
                    className={`han min-h-11 min-w-11 rounded-xl border px-3 py-1.5 ${state} disabled:cursor-default`}
                  >
                    <span className="font-sans font-semibold">{o.key}</span>
                    {q.options && <span className="ml-1">{o.text}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {onCheck && !isLocked && (
            <button type="button" className="btn-secondary text-sm" disabled={!answer} onClick={() => onCheck(q)}>
              Check
            </button>
          )}

          {reveal && (
            <div className={`rounded-xl p-3 text-sm ${correct ? 'bg-good/10' : 'bg-bad/10'}`} data-testid="feedback">
              <p className="font-medium">
                {correct ? '✓ Correct' : `✗ ${answer ? `You chose ${answer}.` : 'Not answered.'} Answer: ${q.correctAnswer}`}
              </p>
              <p className="mt-1">{q.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
