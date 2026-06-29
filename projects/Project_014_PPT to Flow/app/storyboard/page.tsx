"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Camera,
  Clapperboard,
  Download,
  FileInput,
  Heart,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppProgress } from "@/components/ui/AppProgress";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { useFlowProjectStore } from "@/lib/stores/flowProjectStore";
import { useFlowSceneStore } from "@/lib/stores/flowSceneStore";
import { useFlowStoryboardStore } from "@/lib/stores/flowStoryboardStore";
import { useWorkspaceStore } from "@/lib/stores/workspaceStore";
import type { FlowScene } from "@/lib/types/flow";

const storyBeatOptions = [
  "opening",
  "conflict",
  "pain",
  "question",
  "discovery",
  "transformation",
  "future",
  "ending",
] as const;

const emotionOptions = [
  "neutral",
  "curious",
  "concerned",
  "thinking",
  "hopeful",
  "excited",
  "confident",
  "inspired",
] as const;

const cameraOptions = [
  "wide",
  "medium",
  "close_up",
  "slow_dolly",
  "orbit",
  "tracking",
  "drone",
  "logo_push",
] as const;

type SceneFormState = {
  title: string;
  goal: string;
  storyBeat: FlowScene["storyBeat"];
  storyText: string;
  emotion: FlowScene["emotion"];
  durationSec: number;
  camera: FlowScene["camera"];
  voiceOver: string;
  subtitle: string;
  heroImagePrompt: string;
  flowAnimationPrompt: string;
  transition: string;
  continuityNote: string;
  endingFrameNote: string;
  music: string;
  sfx: string;
};

const initialSceneForm: SceneFormState = {
  title: "",
  goal: "",
  storyBeat: "opening",
  storyText: "",
  emotion: "neutral",
  durationSec: 8,
  camera: "medium",
  voiceOver: "",
  subtitle: "",
  heroImagePrompt: "",
  flowAnimationPrompt: "",
  transition: "",
  continuityNote: "",
  endingFrameNote: "",
  music: "",
  sfx: "",
};

export default function StoryboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSceneForm, setNewSceneForm] = useState<SceneFormState>(initialSceneForm);
  const [detailForm, setDetailForm] = useState<SceneFormState>(initialSceneForm);

  const { activeWorkspaceId, loadWorkspaces, setActiveWorkspace } = useWorkspaceStore();
  const { projects, loadProjectsByWorkspace } = useFlowProjectStore();
  const {
    storyboards,
    activeStoryboardId,
    loading: storyboardLoading,
    loadStoryboardsByProject,
    createStoryboard,
    setActiveStoryboard,
  } = useFlowStoryboardStore();
  const {
    scenes,
    activeSceneId,
    loading: sceneLoading,
    loadScenesByProject,
    createScene,
    updateScene,
    deleteScene,
    setActiveScene,
  } = useFlowSceneStore();

  useEffect(() => {
    async function loadData() {
      const workspaces = await loadWorkspaces();
      const workspaceId = activeWorkspaceId ?? workspaces.at(0)?.id;
      if (!workspaceId) return;

      setActiveWorkspace(workspaceId);
      const loadedProjects = await loadProjectsByWorkspace(workspaceId);
      const project =
        loadedProjects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).at(0) ??
        null;
      if (!project) return;

      const loadedStoryboards = await loadStoryboardsByProject(project.id);
      const storyboard =
        loadedStoryboards.at(0) ??
        (await createStoryboard({
          projectId: project.id,
          title: `${project.name} Flow Storyboard`,
          description: "Production studio for Google Flow long-form scene planning.",
          targetDurationSec: project.targetDurationSec,
          targetSceneCount: project.targetSceneCount,
          storyArc: "conflict_discovery_transformation",
          status: "draft",
        }));

      setActiveStoryboard(storyboard.id);
      const loadedScenes = await loadScenesByProject(project.id);
      setActiveScene(loadedScenes.at(0)?.id ?? null);
    }

    void loadData();
  }, [
    activeWorkspaceId,
    createStoryboard,
    loadProjectsByWorkspace,
    loadScenesByProject,
    loadStoryboardsByProject,
    loadWorkspaces,
    setActiveScene,
    setActiveStoryboard,
    setActiveWorkspace,
  ]);

  const currentProject = useMemo(
    () => [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).at(0) ?? null,
    [projects],
  );
  const currentStoryboard = useMemo(
    () =>
      storyboards.find((storyboard) => storyboard.id === activeStoryboardId) ??
      storyboards.at(0) ??
      null,
    [activeStoryboardId, storyboards],
  );
  const activeScene = useMemo(
    () => scenes.find((scene) => scene.id === activeSceneId) ?? scenes.at(0) ?? null,
    [activeSceneId, scenes],
  );

  useEffect(() => {
    if (activeScene) {
      setDetailForm(sceneToForm(activeScene));
    }
  }, [activeScene]);

  async function handleCreateScene(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentProject) return;

    await createScene({
      projectId: currentProject.id,
      storyboardId: currentStoryboard?.id,
      ...newSceneForm,
      heroImageStatus: "not_started",
      flowPromptStatus: "not_started",
      endingFrameStatus: "not_available",
      flowReadyScore: 0,
    });

    setNewSceneForm(initialSceneForm);
    setDialogOpen(false);
  }

  async function handleUpdateScene(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeScene) return;
    await updateScene(activeScene.id, detailForm);
  }

  async function handleDeleteScene() {
    if (!activeScene) return;
    await deleteScene(activeScene.id);
  }

  if (!currentProject && !storyboardLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Flow Storyboard Studio"
          description="A Google Flow long-form production studio for cinematic scene planning."
        />
        <AppCard variant="wood" className="text-center">
          <h2 className="section-title">Create a Flow Project first.</h2>
          <p className="muted-text mx-auto mt-2 max-w-xl">
            Flow Storyboard Studio needs an active Flow Project before scenes can be planned.
          </p>
          <AppButton href="/projects" className="mt-6">
            Go to Flow Projects
          </AppButton>
        </AppCard>
      </div>
    );
  }

  const loading = storyboardLoading || sceneLoading;
  const totalDuration = scenes.reduce((sum, scene) => sum + scene.durationSec, 0);
  const googleFlowReady = average(scenes.map((scene) => scene.flowReadyScore));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={currentProject?.name}
        title="Flow Storyboard Studio"
        description="A production studio for building a complete Google Flow long video scene by scene."
      />

      <TopToolbar
        projectName={currentProject?.name ?? "Flow Project"}
        status={currentStoryboard?.status ?? "draft"}
        currentDuration={totalDuration}
        currentSceneCount={scenes.length}
        googleFlowReady={googleFlowReady}
        onNewScene={() => setDialogOpen(true)}
      />

      {loading ? (
        <AppCard>
          <p className="card-title">Loading Flow Storyboard Studio</p>
          <p className="muted-text mt-2">Reading Storyboard and Scene Workspace data from IndexedDB.</p>
        </AppCard>
      ) : null}

      <TimelineBand
        title="Story Beat Timeline"
        icon={Clapperboard}
        options={storyBeatOptions}
        scenes={scenes}
        field="storyBeat"
        showPercent
      />
      <TimelineBand
        title="Emotion Timeline"
        icon={Heart}
        options={emotionOptions}
        scenes={scenes}
        field="emotion"
      />
      <TimelineBand
        title="Camera Timeline"
        icon={Camera}
        options={cameraOptions}
        scenes={scenes}
        field="camera"
      />

      <section className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <AppCard className="p-0">
          <div className="border-b border-border p-5">
            <p className="caption-text font-semibold uppercase">Scene Workspace List</p>
            <h2 className="card-title mt-1">Scenes</h2>
          </div>
          <div className="max-h-[760px] space-y-2 overflow-y-auto p-3">
            {scenes.length === 0 ? (
              <div className="rounded-radius-md bg-warmWood/40 p-5 text-center">
                <p className="card-title">Start building your Flow Storyboard.</p>
                <p className="muted-text mt-2">Create the first scene to open the production workspace.</p>
                <AppButton className="mt-5" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  New Scene
                </AppButton>
              </div>
            ) : (
              scenes.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setActiveScene(scene.id)}
                  className={`w-full rounded-radius-md border p-4 text-left transition ${
                    activeScene?.id === scene.id
                      ? "border-toyotaRed bg-toyotaRedSoft"
                      : "border-border bg-background hover:bg-surfaceMuted"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="caption-text">Scene{String(scene.sceneNumber).padStart(2, "0")}</p>
                      <h3 className="mt-1 text-sm font-semibold text-textPrimary">{scene.title}</h3>
                    </div>
                    <AppBadge variant={scene.sceneHealthScore >= 80 ? "success" : "warning"}>
                      {scene.sceneHealthScore}%
                    </AppBadge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <AppBadge variant="inProgress">{formatLabel(scene.storyBeat)}</AppBadge>
                    <AppBadge variant="neutral">{scene.durationSec}s</AppBadge>
                  </div>
                </button>
              ))
            )}
          </div>
        </AppCard>

        <SceneDetailWorkspace
          scene={activeScene}
          form={detailForm}
          onChange={setDetailForm}
          onSubmit={handleUpdateScene}
          onDelete={handleDeleteScene}
        />
      </section>

      {dialogOpen ? (
        <NewSceneDialog
          form={newSceneForm}
          onChange={setNewSceneForm}
          onSubmit={handleCreateScene}
          onClose={() => setDialogOpen(false)}
        />
      ) : null}
    </div>
  );
}

function TopToolbar({
  projectName,
  status,
  currentDuration,
  currentSceneCount,
  googleFlowReady,
  onNewScene,
}: {
  projectName: string;
  status: string;
  currentDuration: number;
  currentSceneCount: number;
  googleFlowReady: number;
  onNewScene: () => void;
}) {
  return (
    <AppCard variant="glass" className="sticky top-20 z-10">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="caption-text font-semibold uppercase">Top Toolbar</p>
          <h2 className="card-title mt-1">{projectName}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ToolbarMetric label="Storyboard Status" value={formatLabel(status)} />
          <ToolbarMetric label="Current Duration" value={`${currentDuration}s`} />
          <ToolbarMetric label="Current Scene Count" value={`${currentSceneCount}`} />
          <ToolbarMetric label="Google Flow Ready" value={`${googleFlowReady}%`} />
        </div>
        <div className="flex flex-wrap gap-2">
          <AppButton onClick={onNewScene}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Scene
          </AppButton>
          <AppButton variant="outline">
            <FileInput className="h-4 w-4" aria-hidden="true" />
            Import
          </AppButton>
          <AppButton disabled variant="secondary">
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </AppButton>
        </div>
      </div>
    </AppCard>
  );
}

function TimelineBand<T extends "storyBeat" | "emotion" | "camera">({
  title,
  icon: Icon,
  options,
  scenes,
  field,
  showPercent = false,
}: {
  title: string;
  icon: LucideIcon;
  options: readonly string[];
  scenes: FlowScene[];
  field: T;
  showPercent?: boolean;
}) {
  return (
    <AppCard>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-toyotaRed" aria-hidden="true" />
        <h2 className="card-title">{title}</h2>
      </div>
      <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
        {options.map((option) => {
          const count = scenes.filter((scene) => scene[field] === option).length;
          const percent = countPercent(count, scenes.length);
          return (
            <div key={option} className="min-w-40 rounded-radius-md border border-border bg-background p-4">
              <p className="caption-text">{formatLabel(option)}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-3xl font-bold">{count}</p>
                {showPercent ? <p className="caption-text font-semibold">{percent}%</p> : null}
              </div>
              {showPercent ? <AppProgress className="mt-3" value={percent} /> : null}
            </div>
          );
        })}
      </div>
    </AppCard>
  );
}

function SceneDetailWorkspace({
  scene,
  form,
  onChange,
  onSubmit,
  onDelete,
}: {
  scene: FlowScene | null;
  form: SceneFormState;
  onChange: (form: SceneFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
}) {
  if (!scene) {
    return (
      <AppCard variant="prompt" className="min-h-[560px]">
        <h2 className="section-title">Scene Detail Workspace</h2>
        <p className="muted-text mt-2">
          Select or create a scene to open the cinematic production workspace.
        </p>
      </AppCard>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <AppCard className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="caption-text">Scene{String(scene.sceneNumber).padStart(2, "0")}</p>
            <h2 className="section-title mt-1">Scene Detail Workspace</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <AppButton type="submit">
              <Save className="h-4 w-4" aria-hidden="true" />
              Save Scene
            </AppButton>
            <AppButton type="button" variant="danger" onClick={onDelete}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </AppButton>
          </div>
        </div>

        <WorkspaceSection title="Story">
          <Input label="Goal" value={form.goal} onChange={(goal) => onChange({ ...form, goal })} />
          <Select label="Story Beat" value={form.storyBeat} options={storyBeatOptions} onChange={(storyBeat) => onChange({ ...form, storyBeat: storyBeat as FlowScene["storyBeat"] })} />
          <Textarea label="Story" value={form.storyText} onChange={(storyText) => onChange({ ...form, storyText })} />
          <Select label="Emotion" value={form.emotion} options={emotionOptions} onChange={(emotion) => onChange({ ...form, emotion: emotion as FlowScene["emotion"] })} />
        </WorkspaceSection>

        <WorkspaceSection title="Production">
          <Input label="Duration" type="number" value={`${form.durationSec}`} onChange={(durationSec) => onChange({ ...form, durationSec: Number(durationSec) })} />
          <Select label="Camera" value={form.camera} options={cameraOptions} onChange={(camera) => onChange({ ...form, camera: camera as FlowScene["camera"] })} />
          <Input label="Transition" value={form.transition} onChange={(transition) => onChange({ ...form, transition })} />
          <Textarea label="Continuity" value={form.continuityNote} onChange={(continuityNote) => onChange({ ...form, continuityNote })} />
        </WorkspaceSection>

        <WorkspaceSection title="Google Flow">
          <ReadonlyMetric label="Hero Image Status" value={formatLabel(scene.heroImageStatus)} />
          <ReadonlyMetric label="Ending Frame Status" value={formatLabel(scene.endingFrameStatus)} />
          <ReadonlyMetric label="Prompt Status" value={formatLabel(scene.flowPromptStatus)} />
          <ReadonlyMetric label="Flow Ready" value={`${scene.flowReadyScore}%`} />
          <Textarea label="Hero Image Prompt" value={form.heroImagePrompt} onChange={(heroImagePrompt) => onChange({ ...form, heroImagePrompt })} />
          <Textarea label="Flow Prompt" value={form.flowAnimationPrompt} onChange={(flowAnimationPrompt) => onChange({ ...form, flowAnimationPrompt })} />
        </WorkspaceSection>

        <WorkspaceSection title="Audio">
          <Textarea label="Voice" value={form.voiceOver} onChange={(voiceOver) => onChange({ ...form, voiceOver })} />
          <Textarea label="Subtitle" value={form.subtitle} onChange={(subtitle) => onChange({ ...form, subtitle })} />
          <Input label="Music" value={form.music} onChange={(music) => onChange({ ...form, music })} />
          <Input label="SFX" value={form.sfx} onChange={(sfx) => onChange({ ...form, sfx })} />
        </WorkspaceSection>

        <WorkspaceSection title="QA">
          <div className="rounded-radius-md border border-border bg-background p-4">
            <ScoreRing value={scene.sceneHealthScore} label="Scene Health" size="sm" />
          </div>
          <div className="rounded-radius-md border border-border bg-background p-4">
            <ScoreRing value={scene.flowReadyScore} label="Flow Ready Score" size="sm" />
          </div>
          <ReadonlyMetric label="Consistency" value={scene.sceneHealthScore >= 80 ? "Strong" : "Needs Review"} />
        </WorkspaceSection>
      </AppCard>
    </form>
  );
}

function NewSceneDialog({
  form,
  onChange,
  onSubmit,
  onClose,
}: {
  form: SceneFormState;
  onChange: (form: SceneFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 p-4 backdrop-blur-sm">
      <AppCard className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="caption-text font-semibold uppercase">New Scene Dialog</p>
              <h2 className="section-title mt-1">Create Flow Scene</h2>
              <p className="muted-text mt-2">Add a cinematic beat to the Google Flow production studio.</p>
            </div>
            <AppButton type="button" variant="ghost" onClick={onClose}>Close</AppButton>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Title" value={form.title} onChange={(title) => onChange({ ...form, title })} required />
            <Input label="Goal" value={form.goal} onChange={(goal) => onChange({ ...form, goal })} required />
            <Select label="Story Beat" value={form.storyBeat} options={storyBeatOptions} onChange={(storyBeat) => onChange({ ...form, storyBeat: storyBeat as FlowScene["storyBeat"] })} />
            <Select label="Emotion" value={form.emotion} options={emotionOptions} onChange={(emotion) => onChange({ ...form, emotion: emotion as FlowScene["emotion"] })} />
            <Input label="Duration" type="number" value={`${form.durationSec}`} onChange={(durationSec) => onChange({ ...form, durationSec: Number(durationSec) })} required />
            <Select label="Camera" value={form.camera} options={cameraOptions} onChange={(camera) => onChange({ ...form, camera: camera as FlowScene["camera"] })} />
            <Textarea label="Story" value={form.storyText} onChange={(storyText) => onChange({ ...form, storyText })} />
            <Textarea label="Voice" value={form.voiceOver} onChange={(voiceOver) => onChange({ ...form, voiceOver })} />
            <Textarea label="Subtitle" value={form.subtitle} onChange={(subtitle) => onChange({ ...form, subtitle })} />
            <Textarea label="Hero Image Prompt (placeholder)" value={form.heroImagePrompt} onChange={(heroImagePrompt) => onChange({ ...form, heroImagePrompt })} />
            <Textarea label="Flow Prompt (placeholder)" value={form.flowAnimationPrompt} onChange={(flowAnimationPrompt) => onChange({ ...form, flowAnimationPrompt })} />
            <Input label="Transition" value={form.transition} onChange={(transition) => onChange({ ...form, transition })} />
          </div>
          <div className="flex flex-wrap gap-3">
            <AppButton type="submit">Create Scene</AppButton>
            <AppButton type="button" variant="outline" onClick={onClose}>Cancel</AppButton>
          </div>
        </form>
      </AppCard>
    </div>
  );
}

function WorkspaceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="card-title">{title}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function ToolbarMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-radius-sm border border-border bg-background px-3 py-2">
      <p className="caption-text">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ReadonlyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-radius-sm border border-border bg-background p-4">
      <p className="caption-text">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="caption-text font-semibold">{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-radius-sm border border-border bg-surface px-3 text-sm outline-none focus:border-toyotaRed"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="caption-text font-semibold">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-radius-sm border border-border bg-surface px-3 text-sm outline-none focus:border-toyotaRed"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="caption-text font-semibold">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-24 w-full rounded-radius-sm border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-toyotaRed"
      />
    </label>
  );
}

function sceneToForm(scene: FlowScene): SceneFormState {
  return {
    title: scene.title,
    goal: scene.goal,
    storyBeat: scene.storyBeat,
    storyText: scene.storyText,
    emotion: scene.emotion,
    durationSec: scene.durationSec,
    camera: scene.camera,
    voiceOver: scene.voiceOver,
    subtitle: scene.subtitle,
    heroImagePrompt: scene.heroImagePrompt,
    flowAnimationPrompt: scene.flowAnimationPrompt,
    transition: scene.transition,
    continuityNote: scene.continuityNote,
    endingFrameNote: scene.endingFrameNote,
    music: scene.music,
    sfx: scene.sfx,
  };
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function countPercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
