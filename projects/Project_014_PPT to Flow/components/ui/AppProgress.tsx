import { cn } from "@/lib/utils";

type AppProgressProps = {
  value: number;
  label?: string;
  showValue?: boolean;
  className?: string;
};

export function AppProgress({
  value,
  label,
  showValue = false,
  className,
}: AppProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const tone = getTone(normalizedValue);

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-4">
          {label ? <p className="caption-text font-medium">{label}</p> : <span />}
          {showValue ? <p className="caption-text font-semibold">{normalizedValue}%</p> : null}
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-surfaceMuted">
        <div
          className={cn("h-full rounded-full transition-all", tone)}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}

function getTone(value: number) {
  if (value >= 80) {
    return "bg-success";
  }

  if (value >= 50) {
    return "bg-warning";
  }

  return "bg-danger";
}
