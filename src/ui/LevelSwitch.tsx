import { LEVEL_IDS, LEVELS } from '../content/levels';
import { useSettings } from '../lib/useSettings';

/** HSK 1 / HSK 2 segmented control. The choice is saved and applies to the whole app. */
export default function LevelSwitch() {
  const [settings, update] = useSettings();
  return (
    <div className="inline-flex gap-1 rounded-full border border-line bg-card p-1" role="radiogroup" aria-label="Level">
      {LEVEL_IDS.map((id) => {
        const active = settings.targetLevel === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => update({ targetLevel: id })}
            className={`min-h-10 rounded-full px-4 text-sm font-medium transition ${active ? 'bg-rose text-on-rose' : 'text-muted hover:text-ink'}`}
            data-testid={`level-${id}`}
          >
            {LEVELS[id].name}
          </button>
        );
      })}
    </div>
  );
}
