import type { LucideIcon } from "lucide-react";
import { AppBadge, type AppBadgeProps } from "@/components/ui/AppBadge";
import { AppCard } from "@/components/ui/AppCard";
import { AppProgress } from "@/components/ui/AppProgress";

type StatCardProps = {
  label: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  progress?: number;
  badge?: string;
  badgeVariant?: AppBadgeProps["variant"];
};

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  progress,
  badge,
  badgeVariant = "neutral",
}: StatCardProps) {
  return (
    <AppCard className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-radius-md bg-softBlue">
          <Icon className="h-5 w-5 text-softBlueText" aria-hidden="true" />
        </div>
        {badge ? <AppBadge variant={badgeVariant}>{badge}</AppBadge> : null}
      </div>
      <div>
        <p className="muted-text">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-normal text-textPrimary">{value}</p>
        {description ? <p className="caption-text mt-2">{description}</p> : null}
      </div>
      {typeof progress === "number" ? (
        <AppProgress value={progress} showValue label="Progress" />
      ) : null}
    </AppCard>
  );
}
