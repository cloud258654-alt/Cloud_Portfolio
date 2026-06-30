"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { FileInput, ImagePlus, Loader2, Plus, Sparkles, UploadCloud } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { FormInput } from "@/components/ui/FormInput";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { buildImportPlan, type ImportPlan } from "@/lib/importPipeline";
import { useFlowProjectStore } from "@/lib/stores/flowProjectStore";
import { useFlowSceneStore } from "@/lib/stores/flowSceneStore";
import { useFlowStoryboardStore } from "@/lib/stores/flowStoryboardStore";
import { useWorkspaceStore } from "@/lib/stores/workspaceStore";
import { useLanguage } from "@/lib/i18n";

const emptyPrompt = "";
const settingsKey = "flow-director-settings";

type StoredSettings = {
  defaultTargetDurationSec?: string;
};

export default function ImportPage() {
  const { language } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [projectName, setProjectName] = useState("");
  const [promptText, setPromptText] = useState(emptyPrompt);
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const { workspaces, activeWorkspaceId, loadWorkspaces, createWorkspace } = useWorkspaceStore();
  const { createProject } = useFlowProjectStore();
  const { createStoryboard } = useFlowStoryboardStore();
  const { createScene } = useFlowSceneStore();

  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  const labels = copy[language];
  const fileSummary = useMemo(() => summarizeFiles(files), [files]);

  const onFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setFiles(nextFiles);
    setPlan(null);
    setCreatedProjectId(null);
    setMessage(null);
  };

  const analyzeImport = async () => {
    setBusy(true);
    setMessage(null);
    setCreatedProjectId(null);
    try {
      const nextPlan = await buildImportPlan({ files, promptText, projectName });
      setPlan(nextPlan);
      setProjectName(nextPlan.projectName);
      setMessage(labels.analyzed(nextPlan.scenes.length));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : labels.analyzeError);
    } finally {
      setBusy(false);
    }
  };

  const createFlowProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const importPlan = plan ?? (await buildImportPlan({ files, promptText, projectName }));
      const workspace =
        workspaces.find((item) => item.id === activeWorkspaceId) ??
        workspaces.at(0) ??
        (await createWorkspace({
          name: labels.defaultWorkspace,
          description: labels.defaultWorkspaceDescription,
          defaultLanguage: language === "zh-TW" ? "zh-TW" : "en",
        }));

      const project = await createProject({
        workspaceId: workspace.id,
        name: importPlan.projectName,
        description: importPlan.description,
        brandName: labels.importedBrand,
        targetAudience: labels.importedAudience,
        targetDurationSec: getDefaultTargetDuration(importPlan.scenes.length),
        targetSceneCount: importPlan.scenes.length,
        language: language === "zh-TW" ? "zh-TW" : "en",
        flowStatus: "storyboarding",
        progressPercent: 20,
        googleFlowReadyScore: 35,
        currentSceneNumber: 1,
      });

      const storyboard = await createStoryboard({
        projectId: project.id,
        title: `${project.name} Flow Storyboard`,
        description: labels.storyboardDescription,
        targetDurationSec: project.targetDurationSec,
        targetSceneCount: importPlan.scenes.length,
        storyArc: "custom",
        status: "in_progress",
      });

      for (const [index, scene] of importPlan.scenes.entries()) {
        await createScene({
          projectId: project.id,
          storyboardId: storyboard.id,
          sceneNumber: index + 1,
          title: scene.title,
          goal: labels.sceneGoal(scene.source),
          storyBeat: index === 0 ? "opening" : index === importPlan.scenes.length - 1 ? "ending" : "custom",
          storyText: scene.storyText,
          emotion: "neutral",
          durationSec: 8,
          camera: "medium",
          heroImagePrompt: scene.heroImagePrompt,
          heroImageReferenceName: scene.heroImageReferenceName,
          heroImageReferenceDataUrl: scene.heroImageReferenceDataUrl,
          heroImageStatus: scene.heroImageReferenceDataUrl ? "ready" : scene.heroImagePrompt ? "drafted" : "not_started",
          flowAnimationPrompt: scene.flowAnimationPrompt,
          flowPromptStatus: scene.flowAnimationPrompt ? "drafted" : "not_started",
          endingFrameStatus: "not_available",
          voiceOver: scene.voiceOver,
          subtitle: scene.subtitle,
          music: "",
          sfx: "",
          transition: "",
          continuityNote: labels.continuityNote,
          endingFrameNote: labels.endingFrameNote,
          flowReadyScore: 35,
        });
      }

      setPlan(importPlan);
      setCreatedProjectId(project.id);
      setMessage(labels.created(importPlan.scenes.length));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : labels.createError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={createFlowProject}>
      <PageHeader
        title={labels.title}
        description={labels.description}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <AppCard>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-app bg-accent/10 text-accent">
                <UploadCloud className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="card-title">{labels.sourcesTitle}</h2>
                <p className="muted-text mt-2">{labels.sourcesDescription}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-app border border-dashed border-border bg-background p-6 text-center transition hover:border-accent hover:bg-surfaceMuted">
                <FileInput className="h-8 w-8 text-accent" aria-hidden="true" />
                <span className="mt-3 text-sm font-semibold text-text">{labels.fileDropTitle}</span>
                <span className="mt-2 text-sm leading-6 text-muted">{labels.fileDropDescription}</span>
                <input
                  className="sr-only"
                  type="file"
                  multiple
                  accept=".ppt,.pptx,image/*"
                  onChange={onFilesChange}
                />
              </label>

              <div className="rounded-app border border-border bg-background p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-text">
                  <ImagePlus className="h-4 w-4 text-accent" aria-hidden="true" />
                  {labels.selectedFiles}
                </div>
                <div className="mt-4 space-y-2">
                  {files.length > 0 ? (
                    files.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 rounded-radius-sm bg-surface px-3 py-2 text-sm">
                        <span className="truncate">{file.name}</span>
                        <span className="shrink-0 text-xs text-muted">{formatSize(file.size)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-muted">{labels.noFiles}</p>
                  )}
                </div>
                {fileSummary ? <p className="mt-4 text-xs text-muted">{fileSummary}</p> : null}
              </div>
            </div>
          </AppCard>

          <AppCard>
            <h2 className="card-title">{labels.promptTitle}</h2>
            <p className="muted-text mt-2">{labels.promptDescription}</p>
            <div className="mt-5 space-y-4">
              <FormInput label={labels.projectName} value={projectName} onChange={setProjectName} />
              <FormTextarea label={labels.promptText} value={promptText} onChange={setPromptText} />
            </div>
          </AppCard>

          {plan ? (
            <AppCard>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="card-title">{labels.previewTitle}</h2>
                  <p className="muted-text mt-2">{labels.previewDescription}</p>
                </div>
                <AppBadge variant="success">{labels.sceneCount(plan.scenes.length)}</AppBadge>
              </div>
              <div className="mt-5 space-y-3">
                {plan.scenes.map((scene, index) => (
                  <div key={`${scene.title}-${index}`} className="rounded-app border border-border bg-background p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text">{scene.title}</p>
                        <p className="text-xs text-muted">{scene.source}</p>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{scene.storyText}</p>
                  </div>
                ))}
              </div>
            </AppCard>
          ) : null}
        </div>

        <aside className="space-y-4">
          <AppCard>
            <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
            <h2 className="card-title mt-3">{labels.outputTitle}</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
              <p>{labels.outputProject}</p>
              <p>{labels.outputStoryboard}</p>
              <p>{labels.outputScenes}</p>
              <p>{labels.outputPrompts}</p>
            </div>
            <div className="mt-6 grid gap-3">
              <AppButton type="button" variant="outline" onClick={analyzeImport} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                {labels.analyzeButton}
              </AppButton>
              <AppButton type="submit" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                {labels.createButton}
              </AppButton>
            </div>
            {message ? <p className="mt-4 text-sm leading-6 text-muted">{message}</p> : null}
            {createdProjectId ? (
              <Link href="/storyboard" className="mt-4 inline-flex text-sm font-semibold text-accent">
                {labels.openStoryboard}
              </Link>
            ) : null}
          </AppCard>

          <AppCard>
            <h2 className="card-title">{labels.googleFlowTitle}</h2>
            <p className="muted-text mt-3">{labels.googleFlowDescription}</p>
          </AppCard>
        </aside>
      </div>
    </form>
  );
}

function summarizeFiles(files: File[]) {
  if (!files.length) return "";
  const ppt = files.filter((file) => /\.pptx?$/i.test(file.name)).length;
  const images = files.filter((file) => file.type.startsWith("image/")).length;
  return `${ppt} PPT/PPTX · ${images} image${images === 1 ? "" : "s"}`;
}

function formatSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function getStoredSettings(): StoredSettings {
  try {
    return JSON.parse(window.localStorage.getItem(settingsKey) ?? "{}") as StoredSettings;
  } catch {
    return {};
  }
}

function getDefaultTargetDuration(sceneCount: number) {
  const configured = Number(getStoredSettings().defaultTargetDurationSec);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : Math.max(30, sceneCount * 8);
}

const copy = {
  en: {
    title: "Multimodal Import",
    description: "Import PPT/PPTX, reference images, and prompt text to create a Flow Project, Storyboard, and multiple Flow Scenes.",
    sourcesTitle: "Import sources",
    sourcesDescription: "PPTX text is extracted locally in the browser. Images become visual references. Prompt paragraphs become scene drafts.",
    fileDropTitle: "Choose PPT, PPTX, or images",
    fileDropDescription: "Use .pptx for full slide text extraction. Legacy .ppt files are accepted as source references.",
    selectedFiles: "Selected files",
    noFiles: "No files selected yet.",
    promptTitle: "Prompt input",
    promptDescription: "Paste an outline, scene list, or creative direction. Blank lines split the text into separate Flow Scenes.",
    projectName: "Project Name",
    promptText: "Prompt Text",
    previewTitle: "Import preview",
    previewDescription: "Review the scenes that will be created before writing them to the local workspace.",
    outputTitle: "Generated data",
    outputProject: "Flow Project with duration, audience, language, and progress defaults.",
    outputStoryboard: "Flow Storyboard linked to the imported project.",
    outputScenes: "Multiple Flow Scenes with title, story text, voice over, subtitle, and continuity notes.",
    outputPrompts: "Hero Image Prompt and Google Flow Prompt drafts for every scene.",
    analyzeButton: "Analyze Inputs",
    createButton: "Create Flow Project",
    openStoryboard: "Open Flow Storyboard",
    googleFlowTitle: "For Google Flow",
    googleFlowDescription: "After import, open Storyboard or Scenes. Copy each scene Hero Image Prompt and Flow Prompt into Google Flow, then use Ending Frame notes to chain the next scene.",
    defaultWorkspace: "Local Flow Workspace",
    defaultWorkspaceDescription: "Workspace created during multimodal import.",
    importedBrand: "Imported Source",
    importedAudience: "Google Flow production audience",
    storyboardDescription: "Created from multimodal import sources.",
    continuityNote: "Maintain subject, style, lighting, and camera continuity from imported source material.",
    endingFrameNote: "Use the final frame as a bridge into the next Flow Scene.",
    analyzeError: "Could not analyze the import sources.",
    createError: "Could not create the Flow Project.",
    analyzed: (count: number) => `Analyzed ${count} scene draft${count === 1 ? "" : "s"}.`,
    created: (count: number) => `Created Flow Project with ${count} scene${count === 1 ? "" : "s"}.`,
    sceneCount: (count: number) => `${count} scenes`,
    sceneGoal: (source: string) => `Convert imported source into a Google Flow-ready video scene. Source: ${source}`,
  },
  "zh-TW": {
    title: "多模態匯入",
    description: "匯入 PPT/PPTX、參考圖片與提示詞，自動建立 Flow Project、Storyboard 和多個 Flow Scenes。",
    sourcesTitle: "匯入來源",
    sourcesDescription: "PPTX 會在瀏覽器本機抽取文字；圖片會變成視覺參考；提示詞段落會變成場景草稿。",
    fileDropTitle: "選擇 PPT、PPTX 或圖片",
    fileDropDescription: "建議使用 .pptx 取得完整投影片文字；舊版 .ppt 會先作為來源參考。",
    selectedFiles: "已選檔案",
    noFiles: "尚未選擇檔案。",
    promptTitle: "提示詞輸入",
    promptDescription: "貼上大綱、場景列表或創意方向。空白行會自動切成不同 Flow Scenes。",
    projectName: "專案名稱",
    promptText: "提示詞文字",
    previewTitle: "匯入預覽",
    previewDescription: "寫入本機工作區前，先檢查即將建立的場景。",
    outputTitle: "會產出的資料",
    outputProject: "Flow Project：包含片長、觀眾、語言與進度預設值。",
    outputStoryboard: "Flow Storyboard：連結到匯入後的專案。",
    outputScenes: "多個 Flow Scenes：包含標題、故事文字、旁白、字幕與連續性備註。",
    outputPrompts: "每個場景都會產出 Hero Image Prompt 與 Google Flow Prompt 草稿。",
    analyzeButton: "解析輸入",
    createButton: "建立 Flow 專案",
    openStoryboard: "打開 Flow 分鏡",
    googleFlowTitle: "給 Google Flow 使用",
    googleFlowDescription: "匯入後到 Storyboard 或 Scenes，複製每一幕的 Hero Image Prompt 與 Flow Prompt 到 Google Flow，再用 Ending Frame 備註銜接下一幕。",
    defaultWorkspace: "本機 Flow 工作區",
    defaultWorkspaceDescription: "由多模態匯入流程建立的工作區。",
    importedBrand: "匯入來源",
    importedAudience: "Google Flow 製作觀眾",
    storyboardDescription: "由多模態匯入來源建立。",
    continuityNote: "保持匯入來源的主體、風格、燈光與鏡頭連續性。",
    endingFrameNote: "將最後一幀作為銜接下一個 Flow Scene 的橋接畫面。",
    analyzeError: "無法解析匯入來源。",
    createError: "無法建立 Flow 專案。",
    analyzed: (count: number) => `已解析 ${count} 個場景草稿。`,
    created: (count: number) => `已建立含 ${count} 個場景的 Flow 專案。`,
    sceneCount: (count: number) => `${count} 個場景`,
    sceneGoal: (source: string) => `把匯入來源轉成可供 Google Flow 使用的影片場景。來源：${source}`,
  },
} as const;
