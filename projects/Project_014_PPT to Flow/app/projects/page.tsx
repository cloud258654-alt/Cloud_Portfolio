"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Clock, FolderKanban, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppProgress } from "@/components/ui/AppProgress";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { useFlowProjectStore } from "@/lib/stores/flowProjectStore";
import { useWorkspaceStore } from "@/lib/stores/workspaceStore";
import type { FlowProject } from "@/lib/types/flow";

type ProjectFormState = {
  name: string;
  description: string;
  brandName: string;
  targetAudience: string;
  targetDurationSec: number;
  targetSceneCount: number;
  language: FlowProject["language"];
  flowStatus: FlowProject["flowStatus"];
};

const initialFormState: ProjectFormState = {
  name: "",
  description: "",
  brandName: "",
  targetAudience: "",
  targetDurationSec: 180,
  targetSceneCount: 12,
  language: "zh-TW",
  flowStatus: "draft",
};

const statusLabels: Record<FlowProject["flowStatus"], string> = {
  draft: "Draft",
  storyboarding: "Storyboarding",
  prompting: "Prompting",
  ready_for_flow: "Ready for Flow",
  in_flow_production: "In Flow Production",
  completed: "Completed",
};

const statusVariants: Record<
  FlowProject["flowStatus"],
  "draft" | "inProgress" | "review" | "completed" | "success"
> = {
  draft: "draft",
  storyboarding: "inProgress",
  prompting: "review",
  ready_for_flow: "success",
  in_flow_production: "inProgress",
  completed: "completed",
};

export default function ProjectsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProjectFormState>(initialFormState);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    workspaces,
    activeWorkspaceId,
    loading: workspaceLoading,
    error: workspaceError,
    loadWorkspaces,
    createWorkspace,
    setActiveWorkspace,
  } = useWorkspaceStore();

  const {
    projects,
    loading: projectLoading,
    error: projectError,
    loadProjectsByWorkspace,
    createProject,
  } = useFlowProjectStore();

  const activeWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === activeWorkspaceId),
    [activeWorkspaceId, workspaces],
  );

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const loadedWorkspaces = await loadWorkspaces();
      if (!mounted) {
        return;
      }

      const workspace =
        loadedWorkspaces.at(0) ??
        (await createWorkspace({
          name: "Default Workspace",
          description: "Local Google Flow production workspace.",
          defaultLanguage: "zh-TW",
        }));

      setActiveWorkspace(workspace.id);
      await loadProjectsByWorkspace(workspace.id);
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [createWorkspace, loadProjectsByWorkspace, loadWorkspaces, setActiveWorkspace]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    try {
      const workspace =
        activeWorkspace ??
        (await createWorkspace({
          name: "Default Workspace",
          description: "Local Google Flow production workspace.",
          defaultLanguage: "zh-TW",
        }));

      await createProject({
        workspaceId: workspace.id,
        name: form.name.trim(),
        description: form.description.trim(),
        brandName: form.brandName.trim(),
        targetAudience: form.targetAudience.trim(),
        targetDurationSec: Number(form.targetDurationSec),
        targetSceneCount: Number(form.targetSceneCount),
        language: form.language,
        flowStatus: form.flowStatus,
        progressPercent: 0,
        currentSceneNumber: 1,
        googleFlowReadyScore: 0,
      });

      setForm(initialFormState);
      setFormOpen(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to create Flow Project",
      );
    }
  }

  const loading = workspaceLoading || projectLoading;
  const error = workspaceError ?? projectError ?? submitError;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Google Flow Director OS"
        title="Flow Projects"
        description="Manage Google Flow video production projects."
      />

      <AppCard variant="glass">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="caption-text font-semibold uppercase">Workspace</p>
            <h2 className="card-title mt-2">
              {activeWorkspace?.name ?? "Loading workspace"}
            </h2>
            <p className="muted-text mt-1">
              {activeWorkspace?.description ??
                "Preparing your local Google Flow workspace."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AppBadge variant="inProgress">
              {activeWorkspace?.defaultLanguage ?? "zh-TW"}
            </AppBadge>
            <AppButton onClick={() => setFormOpen((open) => !open)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Flow Project
            </AppButton>
          </div>
        </div>
      </AppCard>

      {error ? (
        <AppCard className="border-danger bg-dangerSoft">
          <p className="card-title text-danger">Something needs attention</p>
          <p className="muted-text mt-2 text-danger">{error}</p>
        </AppCard>
      ) : null}

      {formOpen ? (
        <AppCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="section-title">New Flow Project</h2>
              <p className="muted-text mt-1">
                Create a local project package for Google Flow planning.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Project Name">
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="h-11 w-full rounded-radius-sm border border-border bg-surface px-3 text-sm outline-none focus:border-toyotaRed"
                />
              </Field>
              <Field label="Brand Name">
                <input
                  required
                  value={form.brandName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      brandName: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-radius-sm border border-border bg-surface px-3 text-sm outline-none focus:border-toyotaRed"
                />
              </Field>
              <Field label="Target Audience">
                <input
                  required
                  value={form.targetAudience}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      targetAudience: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-radius-sm border border-border bg-surface px-3 text-sm outline-none focus:border-toyotaRed"
                />
              </Field>
              <Field label="Target Duration Seconds">
                <input
                  required
                  min={1}
                  type="number"
                  value={form.targetDurationSec}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      targetDurationSec: Number(event.target.value),
                    }))
                  }
                  className="h-11 w-full rounded-radius-sm border border-border bg-surface px-3 text-sm outline-none focus:border-toyotaRed"
                />
              </Field>
              <Field label="Target Scene Count">
                <input
                  required
                  min={1}
                  type="number"
                  value={form.targetSceneCount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      targetSceneCount: Number(event.target.value),
                    }))
                  }
                  className="h-11 w-full rounded-radius-sm border border-border bg-surface px-3 text-sm outline-none focus:border-toyotaRed"
                />
              </Field>
              <Field label="Language">
                <select
                  value={form.language}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      language: event.target.value as FlowProject["language"],
                    }))
                  }
                  className="h-11 w-full rounded-radius-sm border border-border bg-surface px-3 text-sm outline-none focus:border-toyotaRed"
                >
                  <option value="zh-TW">zh-TW</option>
                  <option value="en">en</option>
                  <option value="ja">ja</option>
                </select>
              </Field>
              <Field label="Status">
                <select
                  value={form.flowStatus}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      flowStatus: event.target.value as FlowProject["flowStatus"],
                    }))
                  }
                  className="h-11 w-full rounded-radius-sm border border-border bg-surface px-3 text-sm outline-none focus:border-toyotaRed"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Description" className="md:col-span-2">
                <textarea
                  required
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="min-h-28 w-full rounded-radius-sm border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-toyotaRed"
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-3">
              <AppButton type="submit">Create Flow Project</AppButton>
              <AppButton
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </AppButton>
            </div>
          </form>
        </AppCard>
      ) : null}

      {loading ? (
        <AppCard>
          <p className="card-title">Loading Flow Projects</p>
          <p className="muted-text mt-2">
            Reading your local IndexedDB workspace.
          </p>
        </AppCard>
      ) : null}

      {!loading && projects.length === 0 ? (
        <AppCard variant="wood" className="text-center">
          <FolderKanban className="mx-auto h-10 w-10 text-toyotaRed" aria-hidden="true" />
          <h2 className="section-title mt-4">Create your first Google Flow Project</h2>
          <p className="muted-text mx-auto mt-2 max-w-xl">
            Start with a local Flow Project, then build Storyboard, Hero Image,
            Ending Frame, Flow Prompt, and Export Package assets.
          </p>
          <AppButton className="mt-6" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Flow Project
          </AppButton>
        </AppCard>
      ) : null}

      {projects.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </section>
      ) : null}
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className}>
      <span className="caption-text font-semibold text-textSecondary">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function ProjectCard({ project }: { project: FlowProject }) {
  return (
    <AppCard className="flex min-h-96 flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="caption-text font-semibold uppercase">{project.brandName}</p>
            <h2 className="card-title mt-2">{project.name}</h2>
          </div>
          <AppBadge variant={statusVariants[project.flowStatus]}>
            {statusLabels[project.flowStatus]}
          </AppBadge>
        </div>
        <p className="muted-text mt-4">{project.description}</p>
        <AppProgress
          className="mt-6"
          value={project.progressPercent}
          label="Progress"
          showValue
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <InfoTile icon={Clock} label="Target Duration" value={`${project.targetDurationSec}s`} />
          <InfoTile icon={Users} label="Target Audience" value={project.targetAudience} />
          <InfoTile
            icon={FolderKanban}
            label="Target Scenes"
            value={`${project.targetSceneCount}`}
          />
          <div className="rounded-radius-sm border border-border bg-background p-3">
            <ScoreRing
              value={project.googleFlowReadyScore ?? 0}
              label="Flow Ready Score"
              size="sm"
            />
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="caption-text">Updated {formatDate(project.updatedAt)}</p>
        <AppButton href="/storyboard" variant="outline" size="sm">
          Open Project
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </AppButton>
      </div>
    </AppCard>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-radius-sm border border-border bg-background p-3">
      <Icon className="h-4 w-4 text-toyotaRed" aria-hidden="true" />
      <p className="caption-text mt-3">{label}</p>
      <p className="mt-1 text-sm font-semibold text-textPrimary">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
