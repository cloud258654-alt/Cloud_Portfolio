import {
  ArrowRight,
  BadgeCheck,
  Clapperboard,
  Clock,
  Film,
  Gauge,
  Layers3,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppProgress } from "@/components/ui/AppProgress";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { StatCard } from "@/components/ui/StatCard";

const colors = [
  ["Background", "#F8F7F3", "bg-background"],
  ["Surface", "#FFFFFF", "bg-surface"],
  ["Surface Muted", "#F3F1EC", "bg-surfaceMuted"],
  ["Text Primary", "#111827", "bg-textPrimary"],
  ["Text Secondary", "#6B7280", "bg-textSecondary"],
  ["Text Muted", "#9CA3AF", "bg-textMuted"],
  ["Border", "#E5E7EB", "bg-border"],
  ["Toyota Red", "#E11D2E", "bg-toyotaRed"],
  ["Toyota Red Soft", "#FDE8EA", "bg-toyotaRedSoft"],
  ["Soft Blue", "#DCEBFF", "bg-softBlue"],
  ["Warm Wood", "#E8D8C3", "bg-warmWood"],
  ["Warm Wood Dark", "#BFA98C", "bg-warmWoodDark"],
  ["Success", "#16A34A", "bg-success"],
  ["Warning", "#F59E0B", "bg-warning"],
  ["Danger", "#DC2626", "bg-danger"],
  ["Dark", "#111827", "bg-dark"],
];

const buttons = ["primary", "secondary", "ghost", "danger", "success", "outline", "premium"] as const;
const cards = ["default", "glass", "wood", "outline", "premium", "prompt", "timeline"] as const;
const badges = ["draft", "inProgress", "review", "completed", "success", "warning", "danger", "neutral"] as const;

export default function DesignSystemPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Google Flow Director OS"
        title="Design System"
        description="A reusable visual language for premium, calm, Google Flow-focused production tools."
      />

      <section className="space-y-4">
        <h2 className="section-title">Color Palette</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {colors.map(([name, value, className]) => (
            <AppCard key={name} className="p-4">
              <div className={`h-20 rounded-radius-md border border-border ${className}`} />
              <p className="card-title mt-4">{name}</p>
              <p className="code-text text-textSecondary">{value}</p>
            </AppCard>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Typography</h2>
        <AppCard className="space-y-4">
          <p className="display-title">Display Title</p>
          <p className="page-title">Page Title</p>
          <p className="section-title">Section Title</p>
          <p className="card-title">Card Title</p>
          <p className="body-text">Body text for focused production planning and clear review notes.</p>
          <p className="muted-text">Muted text for supporting context and quiet metadata.</p>
          <p className="caption-text">Caption text for compact labels and helper details.</p>
          <p className="code-text">code-text: flow.prompt.scene.duration</p>
        </AppCard>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Buttons</h2>
        <AppCard className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {buttons.map((variant) => (
              <AppButton key={variant} variant={variant}>
                {variant}
              </AppButton>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {(["sm", "md", "lg", "xl"] as const).map((size) => (
              <AppButton key={size} size={size} variant="outline">
                {size}
              </AppButton>
            ))}
          </div>
        </AppCard>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Cards</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((variant) => (
            <AppCard key={variant} variant={variant}>
              <p className={variant === "premium" ? "text-lg font-semibold text-white" : "card-title"}>
                {variant}
              </p>
              <p className={variant === "premium" ? "mt-2 text-sm text-white/70" : "muted-text mt-2"}>
                Reusable surface treatment for Flow director screens.
              </p>
            </AppCard>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Badges</h2>
        <AppCard>
          <div className="flex flex-wrap gap-3">
            {badges.map((variant) => (
              <AppBadge key={variant} variant={variant}>
                {variant}
              </AppBadge>
            ))}
          </div>
        </AppCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <AppCard>
          <h2 className="section-title">Progress</h2>
          <div className="mt-6 space-y-5">
            <AppProgress value={92} label="Success score" showValue />
            <AppProgress value={63} label="Warning score" showValue />
            <AppProgress value={28} label="Danger score" showValue />
          </div>
        </AppCard>

        <AppCard>
          <h2 className="section-title">Score Ring</h2>
          <div className="mt-6 flex flex-wrap items-center gap-8">
            <ScoreRing value={92} label="QA" />
            <ScoreRing value={68} label="Prompt" />
            <ScoreRing value={34} label="Flow" />
          </div>
        </AppCard>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Stat Cards</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Project Progress" value="68%" icon={Film} progress={68} badge="In progress" badgeVariant="inProgress" />
          <StatCard label="Current Scene" value="12" icon={Clapperboard} progress={52} badge="Draft" badgeVariant="draft" />
          <StatCard label="Consistency" value="91" icon={Gauge} progress={91} badge="Strong" badgeVariant="success" />
          <StatCard label="Estimated Duration" value="2:40" icon={Clock} progress={88} badge="On track" badgeVariant="completed" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Sample Dashboard Section</h2>
        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <AppCard variant="prompt">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="caption-text font-semibold uppercase">Production readiness</p>
                <h3 className="card-title mt-2">Flow Storyboard handoff</h3>
              </div>
              <BadgeCheck className="h-5 w-5 text-success" aria-hidden="true" />
            </div>
            <AppProgress className="mt-6" value={82} label="Ready scenes" showValue />
            <div className="mt-6 flex flex-wrap gap-3">
              <AppBadge variant="completed">Bible locked</AppBadge>
              <AppBadge variant="review">Prompt review</AppBadge>
              <AppBadge variant="inProgress">Scene timing</AppBadge>
            </div>
          </AppCard>
          <AppCard variant="premium">
            <Layers3 className="h-6 w-6 text-toyotaRed" aria-hidden="true" />
            <h3 className="mt-5 text-2xl font-semibold tracking-normal text-white">
              Flow Export Package preview
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Markdown, JSON, SRT, and Flow Prompt assets aligned to one visual system.
            </p>
            <AppButton className="mt-6" variant="primary">
              Review exports
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </AppButton>
          </AppCard>
        </div>
      </section>
    </div>
  );
}
