import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: ReactNode;
  accent: 'brand' | 'emerald' | 'red' | 'amber';
}

const accentColors = {
  brand: { bg: 'bg-brand-50', text: 'text-brand-600', icon: 'text-brand-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500' },
  red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500' },
};

export default function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  const c = accentColors[accent];
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-shadow duration-200">
      <div className="space-y-0.5">
        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
        <span className={`text-3xl font-bold ${c.text} block`}>{value}</span>
        {sub && <span className="text-gray-400 text-xs">{sub}</span>}
      </div>
      <div className={`${c.bg} p-3 rounded-xl`}>
        <span className={c.icon}>{icon}</span>
      </div>
    </div>
  );
}
