"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Clapperboard, Plus, Trash2 } from "lucide-react";
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

const storyBeatOptions: FlowScene["storyBeat"][] = [
  "opening",
  "conflict",
  "pain",
  "question",
  "discovery",
  "transformation",
  "future",
  "ending",
  "custom",
];

const emotionOptions: FlowScene["emotion"][] = [
  "neutral",
  "curious",
  "concerned",
  "thinking",
  "hopeful",
  "excited",
  "confident",
  "happy",
  "inspired",
  "custom",
];

const cameraOptions: FlowScene["camera"][] = [
  "wide",
  "medium",
  "close_up",
  "slow_dolly",
  "orbit",
  "tracking",
  "drone",
  "logo_push",
  "custom",
];

const initialSceneForm = {
  title: "",
  goal: "",
  storyBeat: "opening" as FlowScene["storyBeat"],
  storyText: "",
  emotion: "neutral" as FlowScene["emotion"],
  durationSec: 8,
  camera: "medium" as FlowScene["camera"],
  heroImagePrompt: "",
  flowAnimationPrompt: "",
  voiceOver: "",
  subtitle: "",
  music: "",
  sfx: "",
  transition: "",
  continuityNote: "",
  endingFrameNote: "",
};

export default function ScenesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [expandedSceneId, setExpandedSceneId] = useState<string | null>(null);
  const [sceneForm, setSceneForm] = useState(initialSceneForm);

  const { activeWorkspaceId, loadWorkspaces, setActiveWorkspace } = useWorkspaceStore();
  const { projects, loadProjectsByWorkspace } = useFlowProjectStore();
  const { storyboards, loadStoryboardsByProject, createStoryboard } = useFlowStoryboardStore();
  const {
    scenes,
    loading,
    loadScenesByProject,
    createScene,
    deleteScene,
    reorderSceneNumbers,
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
      if (loadedStoryboards.length === 0) {
        await createStoryboard({
          projectId: project.id,
          title: `${project.name} Flow Storyboard`,
          description: "Storyboard workspace for Google Flow scene planning.",
          targetDurationSec: project.targetDurationSec,
          targetSceneCount: project.targetSceneCount,
          storyArc: "conflict_discovery_transformation",
          status: "draft",
        });
      }
      await loadScenesByProject(project.id);
    }

    void loadData();
  }, [
    activeWorkspaceId,
    createStoryboard,
    loadProjectsByWorkspace,
    loadScenesByProject,
    loadStoryboardsByProject,
    loadWorkspaces,
    setActiveWorkspace,
  ]);

  const currentProject = useMemo(
    () => [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).at(0) ?? null,
    [projects],
  );
  const currentStoryboard = storyboards.at(0) ?? null;

  async function handleCreateScene(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentProject) return;

    await createScene({
      projectId: currentProject.id,
      storyboardId: currentStoryboard?.id,
      ...sceneForm,
      heroImageStatus: "not_started",
      flowPromptStatus: "not_started",
      endingFrameStatus: "not_available",
      flowReadyScore: 0,
    });

    setSceneForm(initialSceneForm);
    setFormOpen(false);
  }

  async function moveScene(sceneId: string, direction: "up" | "down") {
    const ids = scenes.map((scene) => scene.id);
    const index = ids.indexOf(sceneId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ids.length) return;
    const nextIds = [...ids];
    [nextIds[index], nextIds[targetIndex]] = [nextIds[targetIndex], nextIds[index]];
    await reorderSceneNumbers(nextIds);
  }

  if (!currentProject && !loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Flow Scenes"
          description="Manage scene workspace cards for Google Flow production."
        />
        <AppCard variant="wood" className="text-center">
          <h2 className="section-title">Create a Flow Project first.</h2>
          <p className="muted-text mx-auto mt-2 max-w-xl">
            Scene Workspace needs an active Flow Project.
          </p>
          <AppButton href="/projects" className="mt-6">Go to Flow Projects</AppButton>
        </AppCard>
      </div>
    );
  }

  const averageHealth = average(scenes.map((scene) => scene.sceneHealthScore));
  const averageFlowReady = average(scenes.map((scene) => scene.flowReadyScore));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={currentProject?.name}
        title="Flow Scenes"
        description="Build Flow Scene cards with Scene Health Score, Hero Image status, Flow Prompt status, and Ending Frame status."
      />

      <AppCard variant="glass">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="caption-text font-semibold uppercase">Project Context</p>
            <h2 className="section-title mt-2">{currentProject?.name}</h2>
            <p className="muted-text mt-2">{currentProject?.description}</p>
          </div>
          <AppButton onClick={() => setFormOpen((open) => !open)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Scene
          </AppButton>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <Metric label="Total Scenes" value={`${scenes.length}`} />
          <Metric label="Scene Health" value={`${averageHealth}`} />
          <Metric label="Flow Ready" value={`${averageFlowReady}`} />
          <Metric label="Target Scenes" value={`${currentProject?.targetSceneCount ?? 0}`} />
        </div>
      </AppCard>

      {formOpen ? (
        <AppCard>
          <SceneForm
            form={sceneForm}
            onChange={setSceneForm}
            onSubmit={handleCreateScene}
            onCancel={() => setFormOpen(false)}
          />
        </AppCard>
      ) : null}

      {loading ? (
        <AppCard>
          <p className="card-title">Loading Flow Scenes</p>
          <p className="muted-text mt-2">Reading scene workspace data from IndexedDB.</p>
        </AppCard>
      ) : null}

      {scenes.length === 0 && !loading ? (
        <AppCard variant="wood" className="text-center">
          <Clapperboard className="mx-auto h-10 w-10 text-toyotaRed" aria-hidden="true" />
          <h2 className="section-title mt-4">Start building your Flow Storyboard.</h2>
          <p className="muted-text mx-auto mt-2 max-w-xl">
            Add the first Flow Scene to begin tracking Hero Image, Ending Frame, Flow Prompt, Voice, Subtitle, and QA readiness.
          </p>
          <AppButton className="mt-6" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Scene
          </AppButton>
        </AppCard>
      ) : null}

      {scenes.length > 0 ? (
        <section className="grid gap-5 xl:grid-cols-[1fr_0.55fr]">
          <div className="grid gap-5 md:grid-cols-2">
            {scenes.map((scene) => (
              <SceneWorkspaceCard
                key={scene.id}
                scene={scene}
                expanded={expandedSceneId === scene.id}
                onToggle={() =>
                  setExpandedSceneId(expandedSceneId === scene.id ? null : scene.id)
                }
                onDelete={() => deleteScene(scene.id)}
                onMoveUp={() => moveScene(scene.id, "up")}
                onMoveDown={() => moveScene(scene.id, "down")}
              />
            ))}
          </div>
          <AppCard>
            <h2 className="card-title">Scene Score Overview</h2>
            <div className="mt-6 flex flex-wrap gap-8">
              <ScoreRing value={averageHealth} label="Scene Health" />
              <ScoreRing value={averageFlowReady} label="Flow Ready" />
            </div>
            <div className="mt-6 space-y-4">
              <AppProgress value={readyCount(scenes, "heroImageStatus", "ready")} label="Ready Hero Images" showValue />
              <AppProgress value={readyCount(scenes, "flowPromptStatus", "ready")} label="Ready Flow Prompts" showValue />
              <AppProgress value={readyCount(scenes, "endingFrameStatus", "available")} label="Available Ending Frames" showValue />
            </div>
          </AppCard>
        </section>
      ) : null}
    </div>
  );
}

function SceneForm({
  form,
  onChange,
  onSubmit,
  onCancel,
}: {
  form: typeof initialSceneForm;
  onChange: (form: typeof initialSceneForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h2 className="section-title">New Scene</h2>
        <p className="muted-text mt-1">Create a Flow Scene workspace card.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Title" value={form.title} onChange={(title) => onChange({ ...form, title })} required />
        <Input label="Goal" value={form.goal} onChange={(goal) => onChange({ ...form, goal })} required />
        <Select label="Story Beat" value={form.storyBeat} options={storyBeatOptions} onChange={(storyBeat) => onChange({ ...form, storyBeat: storyBeat as FlowScene["storyBeat"] })} />
        <Select label="Emotion" value={form.emotion} options={emotionOptions} onChange={(emotion) => onChange({ ...form, emotion: emotion as FlowScene["emotion"] })} />
        <Input label="Duration Sec" type="number" value={`${form.durationSec}`} onChange={(value) => onChange({ ...form, durationSec: Number(value) })} required />
        <Select label="Camera" value={form.camera} options={cameraOptions} onChange={(camera) => onChange({ ...form, camera: camera as FlowScene["camera"] })} />
        <Textarea label="Story Text" value={form.storyText} onChange={(storyText) => onChange({ ...form, storyText })} />
        <Textarea label="Hero Image Prompt" value={form.heroImagePrompt} onChange={(heroImagePrompt) => onChange({ ...form, heroImagePrompt })} />
        <Textarea label="Flow Animation Prompt" value={form.flowAnimationPrompt} onChange={(flowAnimationPrompt) => onChange({ ...form, flowAnimationPrompt })} />
        <Textarea label="Voice Over" value={form.voiceOver} onChange={(voiceOver) => onChange({ ...form, voiceOver })} />
        <Textarea label="Subtitle" value={form.subtitle} onChange={(subtitle) => onChange({ ...form, subtitle })} />
        <Input label="Music" value={form.music} onChange={(music) => onChange({ ...form, music })} />
        <Input label="SFX" value={form.sfx} onChange={(sfx) => onChange({ ...form, sfx })} />
        <Input label="Transition" value={form.transition} onChange={(transition) => onChange({ ...form, transition })} />
        <Textarea label="Continuity Note" value={form.continuityNote} onChange={(continuityNote) => onChange({ ...form, continuityNote })} />
        <Textarea label="Ending Frame Note" value={form.endingFrameNote} onChange={(endingFrameNote) => onChange({ ...form, endingFrameNote })} />
      </div>
      <div className="flex flex-wrap gap-3">
        <AppButton type="submit">Create Scene</AppButton>
        <AppButton type="button" variant="outline" onClick={onCancel}>Cancel</AppButton>
      </div>
    </form>
  );
}

function SceneWorkspaceCard({
  scene,
  expanded,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  scene: FlowScene;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <AppCard className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="caption-text">Scene {String(scene.sceneNumber).padStart(2, "0")}</p>
          <h2 className="card-title mt-1">{scene.title}</h2>
        </div>
        <AppBadge variant={scene.sceneHealthScore >= 80 ? "success" : "warning"}>
          Health {scene.sceneHealthScore}
        </AppBadge>
      </div>
      <p className="muted-text">{scene.goal}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <StatusTile label="Story Beat" value={scene.storyBeat} />
        <StatusTile label="Emotion" value={scene.emotion} />
        <StatusTile label="Duration" value={`${scene.durationSec}s`} />
        <StatusTile label="Camera" value={scene.camera} />
      </div>
      <AppProgress value={scene.sceneHealthScore} label="Scene Health Score" showValue />
      <div className="flex flex-wrap gap-2">
        <AppBadge variant={scene.heroImageStatus === "ready" ? "success" : "draft"}>Hero {formatLabel(scene.heroImageStatus)}</AppBadge>
        <AppBadge variant={scene.flowPromptStatus === "ready" ? "success" : "draft"}>Prompt {formatLabel(scene.flowPromptStatus)}</AppBadge>
        <AppBadge variant={scene.endingFrameStatus === "available" ? "success" : "warning"}>Ending {formatLabel(scene.endingFrameStatus)}</AppBadge>
      </div>
      {expanded ? (
        <div className="space-y-4 rounded-radius-md border border-border bg-background p-4">
          <Detail label="Story Text" value={scene.storyText} />
          <Detail label="Hero Image Prompt" value={scene.heroImagePrompt} />
          <Detail label="Flow Animation Prompt" value={scene.flowAnimationPrompt} />
          <Detail label="Voice Over" value={scene.voiceOver} />
          <Detail label="Subtitle" value={scene.subtitle} />
          <Detail label="Continuity Note" value={scene.continuityNote} />
          <Detail label="Ending Frame Note" value={scene.endingFrameNote} />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <AppButton type="button" size="sm" variant="outline" onClick={onToggle}>
          {expanded ? "Hide Detail" : "Scene Detail"}
        </AppButton>
        <AppButton type="button" size="sm" variant="ghost" onClick={onMoveUp}>
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </AppButton>
        <AppButton type="button" size="sm" variant="ghost" onClick={onMoveDown}>
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </AppButton>
        <AppButton type="button" size="sm" variant="danger" onClick={onDelete}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </AppButton>
      </div>
    </AppCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-radius-sm border border-border bg-background p-4">
      <p className="caption-text">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-radius-sm border border-border bg-background p-3">
      <p className="caption-text">{label}</p>
      <p className="mt-1 text-sm font-semibold">{formatLabel(value)}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="caption-text font-semibold">{label}</p>
      <p className="muted-text mt-1">{value || "Not started"}</p>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="caption-text font-semibold">{label}</span>
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-radius-sm border border-border bg-surface px-3 text-sm outline-none focus:border-toyotaRed" />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="caption-text font-semibold">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-radius-sm border border-border bg-surface px-3 text-sm outline-none focus:border-toyotaRed">
        {options.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}
      </select>
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="caption-text font-semibold">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-24 w-full rounded-radius-sm border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-toyotaRed" />
    </label>
  );
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function readyCount<T extends keyof FlowScene>(scenes: FlowScene[], field: T, readyValue: FlowScene[T]) {
  if (scenes.length === 0) return 0;
  return Math.round((scenes.filter((scene) => scene[field] === readyValue).length / scenes.length) * 100);
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
