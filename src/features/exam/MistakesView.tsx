import PageHeader from '../../ui/PageHeader';
import { useEffect, useMemo, useState } from 'react';
import type { TaskType } from '../../content/types';
import { db } from '../../db/db';
import { href } from '../../lib/router';
import { newExam } from './ExamRunner';
import { CATEGORY, summariseMistakes, type MistakeSummary } from './mistakes';
import { groupById, paperFromMistakes, questionById } from './papers';
import { Feedback } from './QuestionViews';

/** Mistake notebook: every question whose latest answer was wrong, grouped by error category. */
export default function MistakesView() {
  const [mistakes, setMistakes] = useState<MistakeSummary[] | null>(null);
  const [filter, setFilter] = useState<TaskType | 'all'>('all');
  const [showFixed, setShowFixed] = useState(false);

  useEffect(() => {
    db.attempts.toArray().then((a) => setMistakes(summariseMistakes(a)));
  }, []);

  const open = useMemo(() => (mistakes ?? []).filter((m) => m.open && questionById(m.questionId)), [mistakes]);
  const fixed = useMemo(() => (mistakes ?? []).filter((m) => !m.open && questionById(m.questionId)), [mistakes]);
  const counts = useMemo(() => {
    const c = new Map<TaskType, number>();
    for (const m of open) {
      const t = questionById(m.questionId)!.taskType;
      c.set(t, (c.get(t) ?? 0) + 1);
    }
    return c;
  }, [open]);
  const shown = open.filter((m) => filter === 'all' || questionById(m.questionId)!.taskType === filter);

  async function redo() {
    const paper = paperFromMistakes(shown.map((m) => m.questionId));
    await db.exam.put(newExam(paper, 'guided'));
    location.hash = href({ name: 'practice', resume: true });
  }

  if (!mistakes) return <p className="text-muted">Loading…</p>;

  return (
    <div className="space-y-4">
      <PageHeader han="改错 · gǎicuò" title="My mistakes">
        <p className="text-sm text-muted">
          Questions whose latest answer was wrong. Answer one correctly when you redo it and it moves to "Fixed".
        </p>
      </PageHeader>

      {open.length === 0 ? (
        <section className="card flex items-center gap-4" data-testid="no-mistakes">
          <span className="han flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sage text-2xl text-good" lang="zh-CN" aria-hidden>
            好
          </span>
          <div>
          <p className="font-medium">Nothing to fix right now.</p>
          <p className="text-sm text-muted">
            Wrong answers from practice sets and mock exams appear here. <a className="text-rose underline" href={href({ name: 'practice' })}>Go to practice →</a>
          </p>
          </div>
        </section>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter by category">
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label={`All (${open.length})`} />
            {[...counts].map(([t, n]) => (
              <FilterChip key={t} active={filter === t} onClick={() => setFilter(t)} label={`${CATEGORY[t]} (${n})`} />
            ))}
          </div>
          <button type="button" className="btn-primary" onClick={redo} data-testid="redo-mistakes">
            Redo {shown.length} mistake{shown.length === 1 ? '' : 's'} (guided)
          </button>
          <ul className="grid gap-3 lg:grid-cols-2" data-testid="mistake-list">
            {shown.map((m) => (
              <MistakeCard key={m.questionId} m={m} />
            ))}
          </ul>
        </>
      )}

      {fixed.length > 0 && (
        <section className="space-y-3">
          <button type="button" className="text-sm text-rose hover:underline" onClick={() => setShowFixed((s) => !s)} aria-expanded={showFixed}>
            {showFixed ? 'Hide' : 'Show'} fixed ({fixed.length})
          </button>
          {showFixed && (
            <ul className="grid gap-3 lg:grid-cols-2">
              {fixed.map((m) => (
                <MistakeCard key={m.questionId} m={m} fixed />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`min-h-11 rounded-full border px-4 py-1.5 text-sm transition ${active ? 'border-rose bg-rose text-on-rose' : 'border-line bg-card hover:bg-blush'}`}
    >
      {label}
    </button>
  );
}

function MistakeCard({ m, fixed = false }: { m: MistakeSummary; fixed?: boolean }) {
  const q = questionById(m.questionId)!;
  const group = groupById(q.groupId);
  const options = q.options ?? group?.options ?? [];
  const optionText = (key: string) => options.find((o) => o.key === key)?.text;
  return (
    <li className="card space-y-2" data-testid={`mistake-${q.id}`}>
      <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="tag">{CATEGORY[q.taskType]}</span>
        <span>{group?.officialPart}</span>
        <span>· wrong {m.timesWrong}×</span>
        <span>· {new Date(m.lastWrongAt).toLocaleDateString()}</span>
        {fixed && <span className="font-medium text-good">· Fixed</span>}
      </p>
      {q.component ? (
        <p className="han text-xl" lang="zh-CN">
          {q.component.word} <span className="font-sans text-sm text-muted">{q.component.pinyin}</span>
        </p>
      ) : (
        <>
          {q.pinyin && <p className="text-sm text-muted">{q.pinyin}</p>}
          <p className="han text-lg" lang="zh-CN">
            {q.prompt}
          </p>
          {q.question && (
            <p className="han" lang="zh-CN">
              {q.question}
            </p>
          )}
        </>
      )}
      {options.length > 0 && (
        <p className="han text-sm" lang="zh-CN">
          {m.lastAnswer && <span className="text-bad">Your answer: {m.lastAnswer} {optionText(m.lastAnswer)} · </span>}
          <span className="text-good">
            Answer: {q.correctAnswer} {optionText(q.correctAnswer)}
          </span>
        </p>
      )}
      <Feedback q={q} answer={m.lastAnswer} correct={false} />
    </li>
  );
}
