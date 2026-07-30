export function ConfidenceBadge({ value }: { value: number | null }) {
  if (value === null) return null;
  const pct = Math.round(value * 100);
  const tone =
    value >= 0.75
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : value >= 0.5
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

  return (
    <span className={`badge border ${tone}`}>
      🎯 {pct}% confidence
    </span>
  );
}
