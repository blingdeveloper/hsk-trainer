/** Accessible on/off switch. */
export default function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm text-muted hover:text-ink"
    >
      <span className={`relative h-6 w-10 rounded-full transition ${checked ? 'bg-rose' : 'bg-line'}`} aria-hidden>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
      {label}
    </button>
  );
}
