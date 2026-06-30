function getStyle(score: number): string {
  if (score >= 70) return 'bg-red-100 text-red-600 border-red-200';
  if (score >= 30) return 'bg-amber-100 text-amber-600 border-amber-200';
  return 'bg-emerald-100 text-emerald-600 border-emerald-200';
}

export default function RiskScoreBadge({ score }: { score: number }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getStyle(score)}`}>
      風險 {score}
    </span>
  );
}
