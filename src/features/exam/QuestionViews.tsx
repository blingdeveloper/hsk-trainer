import { useEffect, useRef, useState } from 'react';
import type { Option, Question, QuestionGroup, Skill } from '../../content/types';
import HandwritingPad from '../handwriting/HandwritingPad';
import type { Paper } from './papers';
import { isCorrect, type Answers } from './scoring';

const isHan = (c: string) => /\p{Script=Han}/u.test(c);

interface SectionProps {
  paper: Paper;
  skill: Skill;
  answers: Answers;
  locked: Set<string>;
  showFeedback: boolean;
  onAnswer?: (questionId: string, value: string) => void;
  onCheck?: (q: Question) => void;
}

/** All groups of one section. Questions are numbered through the whole paper, like the real exam. */
export function SectionBody({ paper, skill, ...rest }: SectionProps) {
  const groups = paper.groups.filter((g) => g.skill === skill);
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <GroupBlock key={g.id} group={g} paper={paper} {...rest} />
      ))}
    </div>
  );
}

function GroupBlock({ group, paper, ...rest }: Omit<SectionProps, 'skill'> & { group: QuestionGroup }) {
  const qs = paper.questions.filter((q) => q.groupId === group.id);
  return (
    <section className="card space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">{group.officialPart}</p>
        <p className="text-sm">{group.instructions}</p>
      </div>
      {group.options && (
        <ul className="grid grid-cols-1 gap-x-4 gap-y-1 rounded-xl bg-paper p-3 sm:grid-cols-2 lg:grid-cols-3">
          {group.options.map((o) => (
            <li key={o.key} className="han">
              <span className="font-sans font-semibold">{o.key}</span> {o.text}{' '}
              {o.pinyin && <span className="font-sans text-sm text-muted">{o.pinyin}</span>}
            </li>
          ))}
        </ul>
      )}
      <ol className="space-y-4">
        {qs.map((q) => (
          <QuestionItem key={q.id} number={paper.questions.indexOf(q) + 1} q={q} options={q.options ?? group.options ?? []} {...rest} />
        ))}
      </ol>
    </section>
  );
}

/**
 * Answer box for Writing Part 2. Works with pinyin keyboards (IMEs): nothing is
 * trimmed while the IME is still composing, and only a Chinese character is kept.
 */
export function CharacterAnswerInput({
  value,
  disabled,
  label,
  onCommit,
}: {
  value: string;
  disabled: boolean;
  label: string;
  onCommit: (char: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const composing = useRef(false);

  useEffect(() => {
    if (!composing.current) setDraft(value);
  }, [value]);

  function commit(text: string) {
    const han = [...text].filter(isHan);
    if (han.length) {
      const c = han[han.length - 1];
      setDraft(c);
      onCommit(c);
    } else {
      setDraft(text);
      onCommit('');
    }
  }

  const needsHan = draft.trim() !== '' && ![...draft].some(isHan) && !composing.current;

  return (
    <div>
      <input
        aria-label={label}
        lang="zh-CN"
        className="han h-12 w-24 rounded-xl border border-line bg-card text-center text-2xl"
        value={draft}
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onCompositionStart={() => (composing.current = true)}
        onCompositionEnd={(e) => {
          composing.current = false;
          commit(e.currentTarget.value);
        }}
        onChange={(e) => {
          setDraft(e.target.value);
          if (!composing.current) commit(e.target.value);
        }}
      />
      {needsHan && (
        <p className="mt-1 text-xs text-bad" role="status">
          Type a Chinese character (use a pinyin keyboard), or draw it.
        </p>
      )}
    </div>
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
}: Omit<SectionProps, 'skill' | 'paper'> & { q: Question; number: number; options: Option[] }) {
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
            <p className="han text-2xl" lang="zh-CN">
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
              <p className="han text-xl" lang="zh-CN">
                {q.prompt}
              </p>
              {q.question && (
                <p className="han text-lg" lang="zh-CN">
                  {q.question}
                </p>
              )}
            </>
          )}

          {q.taskType === 'writing-2-character' ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-start gap-2">
                <CharacterAnswerInput
                  label={`Answer for question ${number}`}
                  value={answer ?? ''}
                  disabled={isLocked}
                  onCommit={(c) => onAnswer?.(q.id, c)}
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
                const state =
                  reveal && o.key === q.correctAnswer
                    ? 'border-good bg-good/10'
                    : reveal && chosen
                      ? 'border-bad bg-bad/10'
                      : chosen
                        ? 'border-rose bg-blush'
                        : 'border-line bg-card';
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

          {reveal && <Feedback q={q} answer={answer} correct={correct} />}
        </div>
      </div>
    </li>
  );
}

export function Feedback({ q, answer, correct }: { q: Question; answer?: string; correct: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-sm ${correct ? 'bg-good/10' : 'bg-bad/10'}`} data-testid="feedback">
      <p className="font-medium">{correct ? '✓ Correct' : `✗ ${answer ? `You chose ${answer}.` : 'Not answered.'} Answer: ${q.correctAnswer}`}</p>
      <p className="mt-1">{q.explanation}</p>
    </div>
  );
}
