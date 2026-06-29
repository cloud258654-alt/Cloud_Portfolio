"use client";

import { useEffect, useMemo } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Camera,
  Clapperboard,
  Clock,
  FileText,
  Film,
  Heart,
  ImagePlus,
  Images,
  Plus,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppProgress } from "@/components/ui/AppProgress";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { StatCard } from "@/components/ui/StatCard";
import { useFlowProjectStore } from "@/lib/stores/flowProjectStore";
import { useFlowSceneStore } from "@/lib/stores/flowSceneStore";
import { useWorkspaceStore } from "@/lib/stores/workspaceStore";
import type { FlowProject } from "@/lib/types/flow";

const pipeline = [
  "PPT / Idea",
  "Story Planner",
  "Flow Storyboard",
  "Hero Image",
  "Google Flow",
  "Ending Frame",
  "Next Flow Scene",
  "Flow Export Package",
];

const statusLabels: Record<FlowProject["flowStatus"], string> = {
  draft: "Draft",
  storyboarding: "Storyboarding",
  prompting: "Prompting",
  ready_for_flow: "Ready for Flow",
  in_flow_production: "In Flow Production",
  completed: "Completed",
};

const storyBeatOptions = [
  "opening",
  "conflict",
  "pain",
  "question",
  "discovery",
  "transformation",
  "future",
  "ending",
];

const emotionOptions = [
  "neutral",
  "curious",
  "concerned",
  "thinking",
  "hopeful",
  "excited",
  "confident",
  "inspired",
];

const cameraOptions = [
  "wide",
  "medium",
  "close_up",
  "slow_dolly",
  "orbit",
  "tracking",
  "drone",
  "logo_push",
];

export default function DashboardPage() {
  const {
    workspaces,
    activeWorkspaceId,
    loading: workspaceLoading,
    loadWorkspaces,
    setActiveWorkspace,
  } = useWorkspaceStore();
  const {
    projects,
    loading: projectLoading,
    loadProjectsByWorkspace,
  } = useFlowProjectStore();
  const {
    scenes,
    loading: sceneLoading,
    loadScenesByProject,
  } = useFlowSceneStore();

  useEffect(() => {
    let mounted = true;

    async function loadDashboardData() {
      const loadedWorkspaces = await loadWorkspaces();
      if (!mounted) {
        return;
      }

      const workspaceId = activeWorkspaceId ?? loadedWorkspaces.at(0)?.id;
      if (workspaceId) {
        setActiveWorkspace(workspaceId);
        const loadedProjects = await loadProjectsByWorkspace(workspaceId);
        const project =
          loadedProjects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).at(0) ??
          null;
        if (project) {
          await loadScenesByProject(project.id);
        }
      }
    }

    void loadDashboardData();

    return () => {
      mounted = false;
    };
  }, [
    activeWorkspaceId,
    loadProjectsByWorkspace,
    loadScenesByProject,
    loadWorkspaces,
    setActiveWorkspace,
  ]);

  const currentProject = useMemo(
    () =>
      [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).at(0) ??
      null,
    [projects],
  );

  const loading = workspaceLoading || projectLoading || sceneLoading;
  const hasWorkspace = workspaces.length > 0;

  if (!loading && !currentProject) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Google Flow Director OS"
          title="Google Flow production command center"
          description="A production operating system for planning, prompting, and managing Google Flow videos."
        />
        <AppCard variant="wood" className="text-center">
          <Film className="mx-auto h-12 w-12 text-toyotaRed" aria-hidden="true" />
          <h2 className="section-title mt-5">Create your first Google Flow Project</h2>
          <p className="muted-text mx-auto mt-2 max-w-xl">
            {hasWorkspace
              ? "Your workspace is ready. Create a Flow Project to begin managing Storyboard, Hero Image, Ending Frame, Flow Prompt, and Export Package assets."
              : "Create a local workspace and first Flow Project to begin."}
          </p>
          <AppButton href="/projects" className="mt-6">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Go to Flow Projects
          </AppButton>
        </AppCard>
      </div>
    );
  }

  const project = currentProject;
  const readyScore = project?.googleFlowReadyScore ?? 0;
  const currentScene = project?.currentSceneNumber ?? 1;
  const nextTask = getNextTask(project);
  const averageSceneHealth = average(scenes.map((scene) => scene.sceneHealthScore));
  const averageFlowReady = average(scenes.map((scene) => scene.flowReadyScore));
  const readyHeroImages = countPercent(
    scenes.filter((scene) => scene.heroImageStatus === "ready").length,
    scenes.length,
  );
  const readyFlowPrompts = countPercent(
    scenes.filter((scene) => scene.flowPromptStatus === "ready").length,
    scenes.length,
  );
  const availableEndingFrames = countPercent(
    scenes.filter((scene) => scene.endingFrameStatus === "available").length,
    scenes.length,
  );
  const storyboardProgress = project
    ? countPercent(scenes.length, project.targetSceneCount)
    : 0;
  const storyBeatCoverage = coveragePercent(
    scenes.map((scene) => scene.storyBeat),
    storyBeatOptions,
  );
  const emotionCoverage = coveragePercent(
    scenes.map((scene) => scene.emotion),
    emotionOptions,
  );
  const cameraCoverage = coveragePercent(
    scenes.map((scene) => scene.camera),
    cameraOptions,
  );

  const stats = project
    ? [
        {
          label: "Current Flow Project",
          value: project.name,
          description: project.brandName,
          icon: Film,
          progress: project.progressPercent,
          badge: statusLabels[project.flowStatus],
          badgeVariant: "inProgress" as const,
        },
        {
          label: "Current Flow Scene",
          value: scenes.length > 0 ? `Scene ${currentScene}` : "No scenes",
          description:
            scenes.length > 0
              ? "Continue the active Google Flow handoff"
              : "Start building your Flow Storyboard.",
          icon: Clapperboard,
          progress:
            scenes.length > 0
              ? Math.min(100, Math.round((currentScene / project.targetSceneCount) * 100))
              : 0,
          badge: scenes.length > 0 ? "Active" : "Empty",
          badgeVariant: scenes.length > 0 ? ("review" as const) : ("draft" as const),
        },
        {
          label: "Google Flow Ready Score",
          value: `${readyScore}`,
          description: "IndexedDB project score",
          icon: ImagePlus,
          progress: readyScore,
          badge: readyScore >= 80 ? "Ready" : "Build",
          badgeVariant: readyScore >= 80 ? ("success" as const) : ("draft" as const),
        },
        {
          label: "Target Duration",
          value: `${project.targetDurationSec}s`,
          description: `${project.targetSceneCount} Flow Scenes`,
          icon: Clock,
          progress: project.progressPercent,
          badge: project.language,
          badgeVariant: "completed" as const,
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Google Flow Director OS"
        title="Google Flow production command center"
        description="A production operating system for planning, prompting, and managing Google Flow videos."
        actionLabel="New Flow Project"
        actionHref="/projects"
      />

      {loading ? (
        <AppCard>
          <p className="card-title">Loading Flow Project data</p>
          <p className="muted-text mt-2">Reading your local IndexedDB workspace.</p>
        </AppCard>
      ) : null}

      {project ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Storyboard Progress"
              value={`${storyboardProgress}%`}
              description="Scenes planned against target count"
              icon={Film}
              progress={storyboardProgress}
              badge="Storyboard"
              badgeVariant="inProgress"
            />
            <StatCard
              label="Total Scenes"
              value={`${scenes.length}`}
              description="Flow Scenes in current project"
              icon={Clapperboard}
              progress={countPercent(scenes.length, project.targetSceneCount)}
              badge={scenes.length > 0 ? "Scene-level" : "Empty"}
              badgeVariant={scenes.length > 0 ? "inProgress" : "draft"}
            />
            <StatCard
              label="Ready Hero Images"
              value={`${readyHeroImages}%`}
              description="Scenes with Hero Image ready"
              icon={ImagePlus}
              progress={readyHeroImages}
              badge="Hero Image"
              badgeVariant="neutral"
            />
            <StatCard
              label="Ready Flow Prompts"
              value={`${readyFlowPrompts}%`}
              description="Scenes with Flow Prompt ready"
              icon={FileText}
              progress={readyFlowPrompts}
              badge="Prompt"
              badgeVariant="neutral"
            />
            <StatCard
              label="Available Ending Frames"
              value={`${availableEndingFrames}%`}
              description="Scenes with Ending Frame available"
              icon={Images}
              progress={availableEndingFrames}
              badge="Ending Frame"
              badgeVariant="neutral"
            />
            <StatCard
              label="Average Scene Health"
              value={`${averageSceneHealth}`}
              description="Scene workspace completeness"
              icon={BadgeCheck}
              progress={averageSceneHealth}
              badge="Health"
              badgeVariant={averageSceneHealth >= 80 ? "success" : "review"}
            />
            <StatCard
              label="Average Flow Ready"
              value={`${averageFlowReady}`}
              description="Placeholder until prompt QA matures"
              icon={Sparkles}
              progress={averageFlowReady}
              badge="Flow Score"
              badgeVariant={averageFlowReady >= 80 ? "success" : "draft"}
            />
            <StatCard
              label="Story Beat Coverage"
              value={`${storyBeatCoverage}%`}
              description="Opening through Ending coverage"
              icon={Clapperboard}
              progress={storyBeatCoverage}
              badge="Coverage"
              badgeVariant={storyBeatCoverage >= 80 ? "success" : "review"}
            />
            <StatCard
              label="Emotion Coverage"
              value={`${emotionCoverage}%`}
              description="Emotional arc variety"
              icon={Heart}
              progress={emotionCoverage}
              badge="Emotion"
              badgeVariant={emotionCoverage >= 80 ? "success" : "review"}
            />
            <StatCard
              label="Camera Coverage"
              value={`${cameraCoverage}%`}
              description="Production camera language"
              icon={Camera}
              progress={cameraCoverage}
              badge="Camera"
              badgeVariant={cameraCoverage >= 80 ? "success" : "review"}
            />
          </section>

          {scenes.length === 0 ? (
            <AppCard variant="wood" className="text-center">
              <h2 className="section-title">Start building your Flow Storyboard.</h2>
              <p className="muted-text mx-auto mt-2 max-w-xl">
                Add Flow Scenes to unlock Story Beat, Emotion, Camera, Scene Health,
                and Flow Ready progress on the dashboard.
              </p>
              <AppButton href="/storyboard" className="mt-6">
                Open Flow Storyboard Studio
              </AppButton>
            </AppCard>
          ) : null}

          <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <AppCard variant="timeline">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="card-title">Google Flow Production Pipeline</h2>
                  <p className="muted-text mt-1">
                    A focused path from deck or idea to a Flow Export Package.
                  </p>
                </div>
                <AppBadge variant="inProgress">Flow Timeline</AppBadge>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {pipeline.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-radius-sm border border-border p-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-radius-sm bg-background text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <AppProgress
                className="mt-6"
                value={project.progressPercent}
                label="Project Progress"
                showValue
              />
            </AppCard>

            <AppCard variant="premium">
              <div className="flex h-full min-h-64 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/70">Next Google Flow Task</p>
                      <h2 className="mt-3 text-2xl font-semibold tracking-normal">
                        {nextTask}
                      </h2>
                    </div>
                    <Sparkles className="h-5 w-5 text-toyotaRed" aria-hidden="true" />
                  </div>
                  <div className="mt-8 rounded-radius-lg bg-white p-4">
                    <ScoreRing value={readyScore} label="Overall Flow Ready Score" />
                  </div>
                </div>
                <AppButton href="/projects" className="mt-8 w-fit" variant="primary">
                  Open Flow Project
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </AppButton>
              </div>
            </AppCard>
          </section>

          <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
            <AppCard>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="card-title">Flow Ready Score</h2>
                  <p className="muted-text mt-1">
                    Live project readiness from local project data.
                  </p>
                </div>
                <AppBadge variant={readyScore >= 80 ? "completed" : "review"}>
                  {readyScore >= 80 ? "Ready for Google Flow" : "Needs setup"}
                </AppBadge>
              </div>
              <div className="mt-6 space-y-4">
                <AppProgress
                  value={averageFlowReady}
                  label="Average Flow Ready Score"
                  showValue
                />
                <AppProgress
                  value={averageSceneHealth}
                  label="Average Scene Health Score"
                  showValue
                />
                <AppProgress
                  value={readyHeroImages}
                  label="Ready Hero Images"
                  showValue
                />
              </div>
            </AppCard>

            <AppCard variant="prompt">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="card-title">Flow Timeline Preview</h2>
                  <p className="muted-text mt-1">
                    Current project scene path from Hero Image to Google Flow to Ending Frame.
                  </p>
                </div>
                <AppButton href="/flow-timeline" variant="outline">
                  Open Timeline
                </AppButton>
              </div>
              <div className="mt-6 space-y-3">
                {(scenes.length > 0 ? scenes.slice(0, 3) : [1, 2, 3]).map((item) => {
                  const sceneNumber = typeof item === "number" ? item : item.sceneNumber;
                  const actualScene = typeof item === "number" ? null : item;
                  return (
                  <div
                    key={sceneNumber}
                    className="grid gap-3 rounded-radius-md border border-border bg-white p-4 md:grid-cols-[100px_1fr_auto]"
                  >
                    <p className="text-sm font-semibold">
                      Scene {String(sceneNumber).padStart(2, "0")}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <AppBadge variant={actualScene?.heroImageStatus === "ready" ? "completed" : "draft"}>
                        Hero Image
                      </AppBadge>
                      <ArrowUpRight className="h-4 w-4 text-textMuted" aria-hidden="true" />
                      <AppBadge variant={actualScene?.flowPromptStatus === "ready" ? "completed" : "draft"}>
                        Google Flow
                      </AppBadge>
                      <ArrowUpRight className="h-4 w-4 text-textMuted" aria-hidden="true" />
                      <AppBadge variant={actualScene?.endingFrameStatus === "available" ? "completed" : "review"}>
                        Ending Frame
                      </AppBadge>
                    </div>
                    <AppBadge variant={actualScene ? "success" : "neutral"}>
                      {actualScene ? "IndexedDB" : "Queued"}
                    </AppBadge>
                  </div>
                )})}
              </div>
            </AppCard>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <AppCard>
              <FileText className="h-5 w-5 text-toyotaRed" aria-hidden="true" />
              <h2 className="card-title mt-4">Flow Prompt Status</h2>
              <p className="muted-text mt-2">
                Project is {project.progressPercent}% through Flow production setup.
              </p>
            </AppCard>
            <AppCard>
              <Images className="h-5 w-5 text-toyotaRed" aria-hidden="true" />
              <h2 className="card-title mt-4">Ending Frame Status</h2>
              <p className="muted-text mt-2">
                Track Ending Frames once Flow Scenes are created.
              </p>
            </AppCard>
            <AppCard>
              <BadgeCheck className="h-5 w-5 text-toyotaRed" aria-hidden="true" />
              <h2 className="card-title mt-4">Flow Export Package</h2>
              <p className="muted-text mt-2">
                Local package data is ready for the next implementation pass.
              </p>
            </AppCard>
          </section>
        </>
      ) : null}
    </div>
  );
}

function getNextTask(project: FlowProject | null) {
  if (!project) {
    return "Create your first Google Flow Project.";
  }

  if ((project.googleFlowReadyScore ?? 0) < 50) {
    return "Complete the Flow Project brief and Storyboard setup.";
  }

  if (project.progressPercent < 80) {
    return `Prepare Hero Image and Flow Prompt for Scene ${project.currentSceneNumber ?? 1}.`;
  }

  return "Review Flow Export Package readiness.";
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function countPercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function coveragePercent(values: string[], options: string[]) {
  if (values.length === 0) return 0;
  const covered = new Set(values.filter((value) => options.includes(value)));
  return countPercent(covered.size, options.length);
}
