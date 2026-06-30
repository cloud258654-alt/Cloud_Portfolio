"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Clipboard, FileText, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { db } from "@/lib/db";
import { calculateSceneHealthScore } from "@/lib/engines/sceneHealthEngine";
import type { FlowProject, FlowScene } from "@/lib/types/flow";
import type { PromptPackage } from "@/lib/types/prompt";
import { formatLabel } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

type PromptForm = {
  heroImagePrompt: string;
  flowAnimationPrompt: string;
  negativePrompt: string;
  flowPromptStatus: FlowScene["flowPromptStatus"];
};

const emptyForm: PromptForm = {
  heroImagePrompt: "",
  flowAnimationPrompt: "",
  negativePrompt: "",
  flowPromptStatus: "drafted",
};

const statusOptions: FlowScene["flowPromptStatus"][] = [
  "not_started",
  "drafted",
  "ready",
  "needs_revision",
];

export default function PromptsPage() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [projects, setProjects] = useState<FlowProject[]>([]);
  const [scenes, setScenes] = useState<FlowScene[]>([]);
  const [packages, setPackages] = useState<PromptPackage[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedSceneId, setSelectedSceneId] = useState("");
  const [form, setForm] = useState<PromptForm>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      const loadedProjects = await db.flowProjects.orderBy("updatedAt").reverse().toArray();
      setProjects(loadedProjects);
      setSelectedProjectId((current) => current || loadedProjects.at(0)?.id || "");
    }

    void loadProjects();
  }, []);

  useEffect(() => {
    async function loadProjectData() {
      if (!selectedProjectId) {
        setScenes([]);
        setPackages([]);
        setSelectedSceneId("");
        return;
      }

      const [loadedScenes, loadedPackages] = await Promise.all([
        db.flowScenes.where("projectId").equals(selectedProjectId).sortBy("sceneNumber"),
        db.promptPackages.where("projectId").equals(selectedProjectId).toArray(),
      ]);

      setScenes(loadedScenes);
      setPackages(loadedPackages);
      setSelectedSceneId((current) => {
        if (loadedScenes.some((scene) => scene.id === current)) return current;
        return loadedScenes.at(0)?.id || "";
      });
    }

    void loadProjectData();
  }, [selectedProjectId]);

  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedSceneId) ?? null,
    [scenes, selectedSceneId],
  );

  const selectedPackage = useMemo(
    () => packages.find((promptPackage) => promptPackage.sceneId === selectedSceneId) ?? null,
    [packages, selectedSceneId],
  );

  useEffect(() => {
    if (!selectedScene) {
      setForm(emptyForm);
      return;
    }

    setForm({
      heroImagePrompt: selectedScene.heroImagePrompt,
      flowAnimationPrompt: selectedScene.flowAnimationPrompt,
      negativePrompt: selectedPackage?.negativePrompt ?? "",
      flowPromptStatus: selectedScene.flowPromptStatus,
    });
  }, [selectedPackage, selectedScene]);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const readyCount = scenes.filter((scene) => scene.flowPromptStatus === "ready").length;
  const draftedCount = scenes.filter((scene) => scene.flowPromptStatus !== "not_started").length;

  const savePrompt = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProjectId || !selectedScene) {
      setMessage(labels.needScene);
      return;
    }

    const now = new Date().toISOString();
    const sceneDraft = {
      ...selectedScene,
      heroImagePrompt: form.heroImagePrompt.trim(),
      flowAnimationPrompt: form.flowAnimationPrompt.trim(),
      flowPromptStatus: form.flowPromptStatus,
      updatedAt: now,
    };
    const sceneHealthScore = calculateSceneHealthScore(sceneDraft);

    await db.flowScenes.update(selectedScene.id, {
      heroImagePrompt: sceneDraft.heroImagePrompt,
      flowAnimationPrompt: sceneDraft.flowAnimationPrompt,
      flowPromptStatus: sceneDraft.flowPromptStatus,
      sceneHealthScore,
      updatedAt: now,
    });

    const packageInput = {
      projectId: selectedProjectId,
      sceneId: selectedScene.id,
      heroImagePrompt: sceneDraft.heroImagePrompt,
      flowAnimationPrompt: sceneDraft.flowAnimationPrompt,
      negativePrompt: form.negativePrompt.trim(),
      updatedAt: now,
    };

    if (selectedPackage) {
      await db.promptPackages.update(selectedPackage.id, packageInput);
    } else {
      await db.promptPackages.add({
        id: crypto.randomUUID(),
        ...packageInput,
        createdAt: now,
      });
    }

    const [nextScenes, nextPackages] = await Promise.all([
      db.flowScenes.where("projectId").equals(selectedProjectId).sortBy("sceneNumber"),
      db.promptPackages.where("projectId").equals(selectedProjectId).toArray(),
    ]);
    setScenes(nextScenes);
    setPackages(nextPackages);
    setMessage(labels.saved(selectedScene.sceneNumber));
  };

  const copyPackage = async () => {
    if (!selectedScene) return;
    await navigator.clipboard.writeText(
      [
        `# Scene ${selectedScene.sceneNumber}: ${selectedScene.title}`,
        "",
        `## ${labels.heroImagePrompt}`,
        form.heroImagePrompt || labels.emptyValue,
        "",
        `## ${labels.flowAnimationPrompt}`,
        form.flowAnimationPrompt || labels.emptyValue,
        "",
        `## ${labels.negativePrompt}`,
        form.negativePrompt || labels.emptyValue,
      ].join("\n"),
    );
    setMessage(labels.copied);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={labels.title} description={labels.description} />

      {projects.length === 0 ? (
        <AppCard>
          <h2 className="section-title">{labels.emptyProjectTitle}</h2>
          <p className="muted-text mt-3">{labels.emptyProjectDescription}</p>
          <AppButton href="/import" className="mt-6 w-fit">
            {labels.goImport}
          </AppButton>
        </AppCard>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)_22rem]">
          <aside className="space-y-4">
            <AppCard>
              <SelectField
                label={labels.projectLabel}
                value={selectedProjectId}
                options={projects.map((project) => ({ value: project.id, label: project.name }))}
                onChange={setSelectedProjectId}
              />
              <p className="mt-3 text-sm leading-6 text-muted">
                {selectedProject?.brandName || labels.noBrand}
              </p>
            </AppCard>

            <AppCard>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="card-title">{labels.sceneList}</h2>
              </div>
              {scenes.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-muted">{labels.emptySceneDescription}</p>
              ) : (
                <div className="mt-4 space-y-2">
                  {scenes.map((scene) => (
                    <button
                      key={scene.id}
                      type="button"
                      className={`w-full rounded-radius-sm border px-3 py-3 text-left transition ${
                        scene.id === selectedSceneId
                          ? "border-accent bg-surfaceMuted"
                          : "border-border bg-background hover:bg-surfaceMuted"
                      }`}
                      onClick={() => setSelectedSceneId(scene.id)}
                    >
                      <p className="text-sm font-semibold">
                        {labels.sceneNumber(scene.sceneNumber)} {scene.title}
                      </p>
                      <p className="mt-1 text-xs text-muted">{formatLabel(scene.flowPromptStatus)}</p>
                    </button>
                  ))}
                </div>
              )}
            </AppCard>
          </aside>

          <section>
            {selectedScene ? (
              <AppCard>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="caption-text">{labels.promptDraft}</p>
                    <h2 className="section-title mt-1">
                      {labels.sceneNumber(selectedScene.sceneNumber)} {selectedScene.title}
                    </h2>
                  </div>
                  <AppBadge variant={form.flowPromptStatus === "ready" ? "success" : "neutral"}>
                    {formatLabel(form.flowPromptStatus)}
                  </AppBadge>
                </div>

                <form className="mt-6 space-y-5" onSubmit={savePrompt}>
                  <label>
                    <span className="caption-text font-semibold">{labels.status}</span>
                    <select
                      value={form.flowPromptStatus}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          flowPromptStatus: event.target.value as FlowScene["flowPromptStatus"],
                        })
                      }
                      className="mt-2 h-11 w-full rounded-radius-sm border border-border bg-surface px-3 text-sm outline-none focus:border-toyotaRed"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {labels.statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <FormTextarea
                    label={labels.heroImagePrompt}
                    value={form.heroImagePrompt}
                    onChange={(heroImagePrompt) => setForm({ ...form, heroImagePrompt })}
                  />
                  <FormTextarea
                    label={labels.flowAnimationPrompt}
                    value={form.flowAnimationPrompt}
                    onChange={(flowAnimationPrompt) => setForm({ ...form, flowAnimationPrompt })}
                  />
                  <FormTextarea
                    label={labels.negativePrompt}
                    value={form.negativePrompt}
                    onChange={(negativePrompt) => setForm({ ...form, negativePrompt })}
                  />

                  <div className="flex flex-wrap gap-3">
                    <AppButton type="submit">
                      <Save className="h-4 w-4" aria-hidden="true" />
                      {labels.save}
                    </AppButton>
                    <AppButton type="button" variant="outline" onClick={copyPackage}>
                      <Clipboard className="h-4 w-4" aria-hidden="true" />
                      {labels.copy}
                    </AppButton>
                  </div>
                  {message ? <p className="text-sm leading-6 text-muted">{message}</p> : null}
                </form>
              </AppCard>
            ) : (
              <AppCard>
                <h2 className="section-title">{labels.emptySceneTitle}</h2>
                <p className="muted-text mt-3">{labels.emptySceneDescription}</p>
                <AppButton href="/storyboard" className="mt-6 w-fit">
                  {labels.goStoryboard}
                </AppButton>
              </AppCard>
            )}
          </section>

          <aside className="space-y-4">
            <AppCard>
              <h2 className="card-title">{labels.reviewTitle}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric label={labels.drafted} value={`${draftedCount}/${scenes.length}`} />
                <Metric label={labels.ready} value={`${readyCount}/${scenes.length}`} />
              </div>
            </AppCard>

            <AppCard>
              <h2 className="card-title">{labels.previewTitle}</h2>
              <PreviewBlock label={labels.heroImagePrompt} value={form.heroImagePrompt} emptyValue={labels.emptyValue} />
              <PreviewBlock label={labels.flowAnimationPrompt} value={form.flowAnimationPrompt} emptyValue={labels.emptyValue} />
              <PreviewBlock label={labels.negativePrompt} value={form.negativePrompt} emptyValue={labels.emptyValue} />
            </AppCard>
          </aside>
        </div>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
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
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-radius-sm border border-border bg-background p-3">
      <p className="caption-text">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function PreviewBlock({
  label,
  value,
  emptyValue,
}: {
  label: string;
  value: string;
  emptyValue: string;
}) {
  return (
    <div className="mt-4">
      <p className="caption-text font-semibold">{label}</p>
      <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-radius-sm border border-border bg-background p-3 text-sm leading-6 text-muted">
        {value || emptyValue}
      </p>
    </div>
  );
}

const copy = {
  en: {
    title: "Flow Prompts",
    description:
      "Prepare Google Flow prompts from the Project Bible, Hero Image notes, camera continuity, and Ending Frame needs.",
    emptyProjectTitle: "Create or import a Flow Project first.",
    emptyProjectDescription: "Flow prompts are written per scene and included in the export package.",
    goImport: "Go to Multimodal Import",
    projectLabel: "Flow Project",
    noBrand: "No brand specified.",
    sceneList: "Scenes",
    emptySceneTitle: "Create Flow Scenes first.",
    emptySceneDescription: "Scenes from the storyboard will appear here for prompt writing.",
    goStoryboard: "Go to Flow Storyboard",
    promptDraft: "Prompt Draft",
    sceneNumber: (sceneNumber: number) => `Scene ${sceneNumber}`,
    status: "Prompt Status",
    heroImagePrompt: "Hero Image Prompt",
    flowAnimationPrompt: "Google Flow Prompt",
    negativePrompt: "Negative Prompt",
    save: "Save Prompt",
    copy: "Copy Package",
    needScene: "Select a scene first.",
    saved: (sceneNumber: number) => `Saved prompt package for Scene ${sceneNumber}.`,
    copied: "Prompt package copied.",
    reviewTitle: "Flow Review",
    drafted: "Drafted",
    ready: "Ready",
    previewTitle: "Flow Ready Preview",
    emptyValue: "Not provided.",
    statusLabels: {
      not_started: "Not Started",
      drafted: "Drafted",
      ready: "Ready",
      needs_revision: "Needs Revision",
    },
  },
  "zh-TW": {
    title: "Flow 提示詞",
    description: "依據專案聖經、主視覺備註、鏡頭連續性與結尾畫面需求準備 Google Flow 提示詞。",
    emptyProjectTitle: "請先建立或匯入 Flow 專案。",
    emptyProjectDescription: "Flow 提示詞會依場景撰寫，並一併放入匯出資料包。",
    goImport: "前往多模態匯入",
    projectLabel: "Flow 專案",
    noBrand: "尚未指定品牌。",
    sceneList: "場景",
    emptySceneTitle: "請先建立 Flow 場景。",
    emptySceneDescription: "分鏡中的場景會出現在這裡，供你撰寫提示詞。",
    goStoryboard: "前往 Flow 分鏡",
    promptDraft: "提示詞草稿",
    sceneNumber: (sceneNumber: number) => `場景 ${sceneNumber}`,
    status: "提示詞狀態",
    heroImagePrompt: "主視覺圖片提示詞",
    flowAnimationPrompt: "Google Flow 提示詞",
    negativePrompt: "負面提示詞",
    save: "儲存提示詞",
    copy: "複製套件",
    needScene: "請先選擇場景。",
    saved: (sceneNumber: number) => `已儲存場景 ${sceneNumber} 的提示詞套件。`,
    copied: "已複製提示詞套件。",
    reviewTitle: "Flow 檢視",
    drafted: "已撰寫",
    ready: "已就緒",
    previewTitle: "Flow 就緒預覽",
    emptyValue: "尚未提供。",
    statusLabels: {
      not_started: "尚未開始",
      drafted: "草稿",
      ready: "就緒",
      needs_revision: "需修正",
    },
  },
} as const;
