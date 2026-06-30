const STYLES: Record<string, string> = {
  P0: 'bg-red-600 text-white border-red-600',
  P1: 'bg-amber-500 text-white border-amber-500',
  P2: 'bg-blue-600 text-white border-blue-600',
  P3: 'bg-gray-100 text-gray-500 border-gray-200',
};

const LABELS: Record<string, string> = {
  P0: 'P0 立即',
  P1: 'P1 緊急',
  P2: 'P2 當日',
  P3: 'P3 觀察',
};

export default function PriorityBadge({ priority, compact = false }: { priority: string; compact?: boolean }) {
  const style = STYLES[priority] || STYLES.P3;
  const label = compact ? priority : (LABELS[priority] || priority);
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${style}`}>
      {label}
    </span>
  );
}
