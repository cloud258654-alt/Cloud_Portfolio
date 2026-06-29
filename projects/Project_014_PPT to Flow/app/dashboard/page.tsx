import { ArrowUpRight, Clapperboard, Film, Gauge, Layers3, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

const stats = [
  { label: "Active projects", value: "3", tone: "bg-soft-blue", icon: Film },
  { label: "Scenes drafted", value: "42", tone: "bg-warm-wood", icon: Clapperboard },
  { label: "QA average", value: "91", tone: "bg-white", icon: Gauge },
  { label: "Exports ready", value: "8", tone: "bg-white", icon: Layers3 },
];

const workflow = [
  "Project brief",
  "Storyboard",
  "Project bible",
  "Scene builder",
  "Prompt builder",
  "QA center",
  "Export",
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Google Flow Enterprise Director OS"
        title="AI Filmmaking Platform for Google Flow"
        description="Plan enterprise videos from PPT input through story, bible, scene prompts, voice, subtitles, QA, and export."
        actionLabel="New project"
        actionHref="/projects"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-app border border-border bg-surface p-5 shadow-subtle">
              <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-app ${stat.tone}`}>
                <Icon className="h-5 w-5 text-text" aria-hidden="true" />
              </div>
              <p className="text-sm text-muted">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-normal">{stat.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-app border border-border bg-surface p-6 shadow-subtle">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Production workflow</h2>
              <p className="mt-1 text-sm text-muted">A structured path from concept to Flow-ready assets.</p>
            </div>
            <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {workflow.map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-app border border-border p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-app bg-background text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-app border border-border bg-text p-6 text-white shadow-subtle">
          <div className="flex h-full min-h-64 flex-col justify-between">
            <div>
              <p className="text-sm text-white/70">Director command center</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-normal">Keep creative continuity visible before anything reaches Flow.</h2>
            </div>
            <a
              href="/qa"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-app bg-accent px-4 py-2 text-sm font-semibold text-white"
            >
              Open QA
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
