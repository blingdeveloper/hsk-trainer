import { useLevel } from '../../lib/useSettings';

/** Level tag. Words above the level you're studying are marked, so you know they aren't in your exam. */
export default function HskTag({ level, via }: { level?: number; via?: string }) {
  const studying = useLevel();
  if (!level) return null;
  const name = level >= 7 ? 'HSK 7–9' : `HSK ${level}`;
  const where = via ? (
    <>
      {' '}· in <span className="han" lang="zh-CN">{via}</span>
    </>
  ) : null;
  if (level <= studying.id) return <span className="tag">{name}{where}</span>;
  return (
    <span className="tag bg-paper text-muted" title={`Not in the ${studying.name} word list`}>
      {name} · above {studying.name}
      {where}
    </span>
  );
}
