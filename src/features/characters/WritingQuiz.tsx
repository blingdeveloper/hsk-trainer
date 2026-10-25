import { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { loadStrokeData } from '../strokes/StrokeOrder';
import { cssVar, useColorScheme } from '../../lib/theme';

export type QuizMode = 'watch' | 'trace' | 'memory';

interface Props {
  char: string;
  mode: QuizMode;
  size?: number;
  /** Called once when a trace or memory quiz is finished. */
  onFinish?: (mistakes: number) => void;
}

/**
 * Hanzi Writer in three modes:
 * - watch: plays the stroke-order animation
 * - trace: write over a grey outline
 * - memory: write with no outline; a hint appears after 3 misses on a stroke
 */
export default function WritingQuiz({ char, mode, size = 260, onFinish }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const [run, setRun] = useState(0);
  const scheme = useColorScheme();
  /** Key of the quiz that has loaded its data and accepts input. Compared per render, so it is never stale. */
  const quizKey = `${char}|${mode}|${size}|${run}|${scheme}`;
  const [readyKey, setReadyKey] = useState('');
  const ready = readyKey === quizKey;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';
    setMistakes(0);
    setDone(false);
    setError(false);
    // Ignore callbacks from a quiz this effect has already replaced.
    let live = true;
    const writer = HanziWriter.create(el, char, {
      width: size,
      height: size,
      padding: 10,
      showCharacter: mode === 'watch',
      showOutline: mode !== 'memory',
      strokeColor: cssVar('--color-ink'),
      outlineColor: cssVar('--color-line'),
      highlightColor: cssVar('--color-rose'),
      drawingColor: cssVar('--color-ink'),
      drawingWidth: 6,
      delayBetweenStrokes: 300,
      charDataLoader: (c, onLoad, onError) => {
        loadStrokeData(c).then(onLoad).catch((err) => {
          setError(true);
          onError(err);
        });
      },
    });
    writerRef.current = writer;
    if (mode === 'watch') {
      // Missing stroke data is reported by charDataLoader; don't leave the rejection unhandled.
      writer.animateCharacter().catch(() => {});
    } else {
      writer
        .quiz({
          showHintAfterMisses: mode === 'memory' ? 3 : 1,
          onMistake: () => live && setMistakes((m) => m + 1),
          onComplete: ({ totalMistakes }) => {
            if (!live) return;
            setDone(true);
            onFinishRef.current?.(totalMistakes);
          },
        })
        .then(() => live && setReadyKey(quizKey))
        .catch(() => {});
    }
    return () => {
      live = false;
      writer.cancelQuiz();
      writerRef.current = null;
    };
  }, [char, mode, size, run, quizKey]);

  if (error) return <p className="text-bad">No stroke data for {char}.</p>;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={ref}
        data-testid="writing-quiz"
        data-ready={mode === 'watch' || ready}
        className="rounded-3xl border border-line bg-card shadow-[var(--shadow-soft)]"
        style={{ width: size, height: size, touchAction: 'none', backgroundImage: grid(cssVar('--color-line')), backgroundSize: '100% 100%' }}
      />
      <div className="flex items-center gap-3 text-sm" aria-live="polite">
        {mode !== 'watch' && (
          <span className={done ? 'font-medium text-good' : 'text-muted'} data-testid="quiz-status">
            {done ? `✓ Done, ${mistakes} mistake${mistakes === 1 ? '' : 's'}` : `Mistakes: ${mistakes}`}
          </span>
        )}
        <button type="button" className="btn-secondary text-sm" onClick={() => setRun((r) => r + 1)}>
          {mode === 'watch' ? '▶ Replay' : '↺ Restart'}
        </button>
      </div>
    </div>
  );
}

// Rice-grid (米字格) guide drawn as an SVG background.
function grid(color: string) {
  return `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><g stroke="${color}" stroke-width="0.6" stroke-dasharray="2 2"><line x1="50" y1="0" x2="50" y2="100"/><line x1="0" y1="50" x2="100" y2="50"/><line x1="0" y1="0" x2="100" y2="100"/><line x1="100" y1="0" x2="0" y2="100"/></g></svg>`,
  )}")`;
}
