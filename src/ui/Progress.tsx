/** Thin horizontal progress bar. */
export function ProgressBar({ value, max, label, tone = 'rose' }: { value: number; max: number; label: string; tone?: 'rose' | 'good' }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className={`h-full rounded-full transition-[width] duration-500 ${tone === 'good' ? 'bg-good' : 'bg-rose'}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Circular progress with the value in the middle. */
export function Ring({ value, max, size = 76, children, label }: { value: number; max: number; size?: number; children?: React.ReactNode; label: string }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const pct = max ? Math.min(1, value / max) : 0;
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="6" className="stroke-line" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className="stroke-rose transition-[stroke-dashoffset] duration-700"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <span className="absolute text-center text-sm font-semibold">{children}</span>
    </div>
  );
}
