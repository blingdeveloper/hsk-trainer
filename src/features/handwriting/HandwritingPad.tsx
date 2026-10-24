import { useCallback, useEffect, useRef, useState } from 'react';
import { recognise, warmUpRecogniser, type Stroke } from './recogniser';

interface Props {
  /** Called with the chosen candidate character. */
  onPick: (char: string) => void;
  size?: number;
  /** Clears the pad after a candidate is picked (useful for answer entry). */
  clearOnPick?: boolean;
}

export default function HandwritingPad({ onPick, size = 280, clearOnPick = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef<Stroke | null>(null);
  const [strokeCount, setStrokeCount] = useState(0);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    warmUpRecogniser().then(
      () => setStatus('ready'),
      () => setStatus('error'),
    );
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    // Rice-grid guide lines (米字格)
    ctx.strokeStyle = '#eedfdf';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2);
    ctx.moveTo(0, 0); ctx.lineTo(size, size);
    ctx.moveTo(size, 0); ctx.lineTo(0, size);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#2b2326';
    ctx.lineWidth = Math.max(4, size / 45);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const all = drawingRef.current ? [...strokesRef.current, drawingRef.current] : strokesRef.current;
    for (const stroke of all) {
      ctx.beginPath();
      stroke.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      if (stroke.length === 1) ctx.lineTo(stroke[0][0] + 0.1, stroke[0][1]);
      ctx.stroke();
    }
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    redraw();
  }, [size, redraw]);

  const update = useCallback(async () => {
    setStrokeCount(strokesRef.current.length);
    redraw();
    try {
      setCandidates(await recognise(strokesRef.current));
    } catch {
      setStatus('error');
    }
  }, [redraw]);

  function point(e: React.PointerEvent): [number, number] {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [
      Math.round(((e.clientX - rect.left) / rect.width) * size),
      Math.round(((e.clientY - rect.top) / rect.height) * size),
    ];
  }

  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawingRef.current = [point(e)];
    redraw();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drawingRef.current) return;
    drawingRef.current.push(point(e));
    redraw();
  }

  function onPointerUp() {
    if (!drawingRef.current) return;
    strokesRef.current = [...strokesRef.current, drawingRef.current];
    drawingRef.current = null;
    void update();
  }

  function undo() {
    strokesRef.current = strokesRef.current.slice(0, -1);
    void update();
  }

  function clear() {
    strokesRef.current = [];
    setCandidates([]);
    setStrokeCount(0);
    redraw();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        data-testid="handwriting-canvas"
        aria-label="Handwriting pad. Draw one Chinese character."
        style={{ width: size, height: size, touchAction: 'none' }}
        className="rounded-2xl border border-line bg-card shadow-sm cursor-crosshair"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <div className="flex gap-2">
        <button type="button" onClick={undo} disabled={!strokeCount} className="btn-secondary">
          Undo stroke
        </button>
        <button type="button" onClick={clear} disabled={!strokeCount} className="btn-secondary">
          Clear
        </button>
      </div>
      <div className="min-h-14 w-full" aria-live="polite">
        {status === 'loading' && <p className="text-sm text-muted text-center">Loading recogniser…</p>}
        {status === 'error' && (
          <p className="text-sm text-bad text-center">Recogniser data isn't available. Reload while online once to install it.</p>
        )}
        {status === 'ready' && strokeCount === 0 && (
          <p className="text-sm text-muted text-center">Draw a character. Stroke order and count help recognition.</p>
        )}
        {candidates.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-2" aria-label="Recognition candidates">
            {candidates.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  data-testid="candidate"
                  onClick={() => {
                    onPick(c);
                    if (clearOnPick) clear();
                  }}
                  className="han h-12 w-12 rounded-xl border border-line bg-card text-2xl hover:bg-blush focus-visible:outline-2 focus-visible:outline-rose"
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
