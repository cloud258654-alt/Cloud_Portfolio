import { cn } from "@/lib/utils";

type ScoreRingProps = {
  value: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: { box: "h-20 w-20", radius: 32, stroke: 7, text: "text-lg" },
  md: { box: "h-28 w-28", radius: 44, stroke: 8, text: "text-2xl" },
  lg: { box: "h-36 w-36", radius: 58, stroke: 10, text: "text-3xl" },
};

export function ScoreRing({ value, label, size = "md", className }: ScoreRingProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const config = sizes[size];
  const circumference = 2 * Math.PI * config.radius;
  const offset = circumference - (normalizedValue / 100) * circumference;
  const tone = getStrokeTone(normalizedValue);
  const viewBox = config.radius * 2 + config.stroke * 2;
  const center = viewBox / 2;

  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <div className={cn("relative", config.box)}>
        <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${viewBox} ${viewBox}`}>
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            fill="none"
            stroke="#F3F1EC"
            strokeWidth={config.stroke}
          />
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            fill="none"
            stroke={tone}
            strokeLinecap="round"
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold text-textPrimary", config.text)}>
            {normalizedValue}
          </span>
        </div>
      </div>
      {label ? <p className="caption-text font-medium">{label}</p> : null}
    </div>
  );
}

function getStrokeTone(value: number) {
  if (value >= 80) {
    return "#16A34A";
  }

  if (value >= 50) {
    return "#F59E0B";
  }

  return "#DC2626";
}
