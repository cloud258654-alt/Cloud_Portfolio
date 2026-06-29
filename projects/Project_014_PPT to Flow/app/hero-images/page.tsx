"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Check, Clipboard, ImagePlus, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { db } from "@/lib/db";
import type { FlowProject, FlowScene } from "@/lib/types/flow";
import { useLanguage } from "@/lib/i18n";

type HeroScene = FlowScene & {
  heroImageReferenceName?: string;
  heroImageReferenceDataUrl?: string;
};

const heroStatuses: FlowScene["heroImageStatus"][] = [
  "not_started",
  "drafted",
  "ready",
  "needs_revision",
];

export default function HeroImagesPage() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [projects, setProjects] = useState<FlowProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [scenes, setScenes] = useState<HeroScene[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<FlowScene["heroImageStatus"]>("not_started");
  const [imageName, setImageName] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      const loadedProjects = await db.flowProjects.orderBy("updatedAt").reverse().toArray();
      setProjects(loadedProjects);
      setSelectedProjectId((current) => current || loadedProjects.at(0)?.id || "");
    }

    void loadProjects();
  }, []);

  useEffect(() => {
    async function loadScenes() {
      if (!selectedProjectId) {
        setScenes([]);
        setSelectedSceneId("");
        return;
      }

      const loadedScenes = (await db.flowScenes
        .where("projectId")
        .equals(selectedProjectId)
        .sortBy("sceneNumber")) as HeroScene[];
      setScenes(loadedScenes);
      setSelectedSceneId((current) => current || loadedScenes.at(0)?.id || "");
    }

    void loadScenes();
  }, [selectedProjectId]);

  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedSceneId) ?? null,
    [scenes, selectedSceneId],
  );

  useEffect(() => {
    if (!selectedScene) {
      setPrompt("");
      setStatus("not_started");
      setImageName("");
      setImageDataUrl("");
      return;
    }

    setPrompt(selectedScene.heroImagePrompt || "");
    setStatus(selectedScene.heroImageStatus);
    setImageName(selectedScene.heroImageReferenceName || "");
    setImageDataUrl(selectedScene.heroImageReferenceDataUrl || "");
    setMessage(null);
    setCopied(false);
  }, [selectedScene]);

  const projectOptions = projects.map((project) => project.id);
  const projectNames = Object.fromEntries(projects.map((project) => [project.id, project.name]));
  const sceneOptions = scenes.map((scene) => scene.id);
  const sceneNames = Object.fromEntries(
    scenes.map((scene) => [scene.id, `${scene.sceneNumber}. ${scene.title}`]),
  );

  const onImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    setImageDataUrl(await readFileAsDataUrl(file));
    if (status === "not_started") setStatus("drafted");
  };

  const saveHeroImage = async () => {
    if (!selectedScene) return;
    await db.flowScenes.update(selectedScene.id, {
      heroImagePrompt: prompt,
      heroImageStatus: status,
      heroImageReferenceName: imageName || undefined,
      heroImageReferenceDataUrl: imageDataUrl || undefined,
      updatedAt: new Date().toISOString(),
    });

    setScenes((current) =>
      current.map((scene) =>
        scene.id === selectedScene.id
          ? {
              ...scene,
              heroImagePrompt: prompt,
              heroImageStatus: status,
              heroImageReferenceName: imageName || undefined,
              heroImageReferenceDataUrl: imageDataUrl || undefined,
            }
          : scene,
      ),
    );
    setMessage(labels.saved);
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={labels.title} description={labels.description} />

      {projects.length === 0 ? (
        <AppCard>
          <h2 className="section-title">{labels.emptyTitle}</h2>
          <p className="muted-text mt-3">{labels.emptyDescription}</p>
          <AppButton href="/import" className="mt-6 w-fit">
            {labels.goImport}
          </AppButton>
        </AppCard>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
          <aside className="space-y-4">
            <AppCard>
              <FormSelect
                label={labels.projectLabel}
                value={selectedProjectId}
                options={projectOptions}
                onChange={(value) => {
                  setSelectedProjectId(value);
                  setSelectedSceneId("");
                }}
              />
              <p className="mt-3 text-sm leading-6 text-muted">
                {projectNames[selectedProjectId] ?? labels.noProject}
              </p>
            </AppCard>

            <AppCard>
              <FormSelect
                label={labels.sceneLabel}
                value={selectedSceneId}
                options={sceneOptions}
                onChange={setSelectedSceneId}
              />
              <p className="mt-3 text-sm leading-6 text-muted">
                {selectedScene ? sceneNames[selectedScene.id] : labels.noScene}
              </p>
            </AppCard>

            <AppCard>
              <h2 className="card-title">{labels.sceneCoverage}</h2>
              <div className="mt-4 space-y-2">
                {scenes.map((scene) => (
                  <button
                    key={scene.id}
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-radius-sm border border-border bg-background px-3 py-2 text-left text-sm transition hover:bg-surfaceMuted"
                    onClick={() => setSelectedSceneId(scene.id)}
                  >
                    <span className="truncate">{scene.sceneNumber}. {scene.title}</span>
                    <StatusBadge status={scene.heroImageStatus} />
                  </button>
                ))}
              </div>
            </AppCard>
          </aside>

          <section className="space-y-6">
            {!selectedScene ? (
              <AppCard>
                <h2 className="section-title">{labels.noSceneTitle}</h2>
                <p className="muted-text mt-3">{labels.noSceneDescription}</p>
              </AppCard>
            ) : (
              <>
                <AppCard>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="caption-text font-semibold">{labels.currentScene}</p>
                      <h2 className="section-title mt-2">{sceneNames[selectedScene.id]}</h2>
                      <p className="muted-text mt-2">{selectedScene.storyText}</p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                </AppCard>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
                  <AppCard>
                    <h2 className="card-title">{labels.referenceImage}</h2>
                    <label className="mt-4 flex min-h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-app border border-dashed border-border bg-background text-center transition hover:border-accent hover:bg-surfaceMuted">
                      {imageDataUrl ? (
                        <Image
                          src={imageDataUrl}
                          alt={imageName || labels.referenceImage}
                          width={720}
                          height={420}
                          unoptimized
                          className="h-72 w-full object-cover"
                        />
                      ) : (
                        <div className="p-6">
                          <ImagePlus className="mx-auto h-8 w-8 text-accent" aria-hidden="true" />
                          <span className="mt-3 block text-sm font-semibold text-text">{labels.uploadImage}</span>
                          <span className="mt-2 block text-sm leading-6 text-muted">{labels.uploadHelp}</span>
                        </div>
                      )}
                      <input className="sr-only" type="file" accept="image/*" onChange={onImageChange} />
                    </label>
                    {imageName ? <p className="mt-3 truncate text-sm text-muted">{imageName}</p> : null}
                  </AppCard>

                  <AppCard>
                    <div className="grid gap-4">
                      <FormSelect
                        label={labels.statusLabel}
                        value={status}
                        options={heroStatuses}
                        onChange={(value) => setStatus(value as FlowScene["heroImageStatus"])}
                      />
                      <FormTextarea label={labels.promptLabel} value={prompt} onChange={setPrompt} />
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <AppButton type="button" onClick={saveHeroImage}>
                        <Save className="h-4 w-4" aria-hidden="true" />
                        {labels.save}
                      </AppButton>
                      <AppButton type="button" variant="outline" onClick={copyPrompt} disabled={!prompt.trim()}>
                        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Clipboard className="h-4 w-4" aria-hidden="true" />}
                        {labels.copyPrompt}
                      </AppButton>
                    </div>
                    {message ? <p className="mt-4 text-sm leading-6 text-muted">{message}</p> : null}
                  </AppCard>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: FlowScene["heroImageStatus"] }) {
  const variant = status === "ready" ? "success" : status === "needs_revision" ? "warning" : status === "drafted" ? "inProgress" : "neutral";
  return <AppBadge variant={variant}>{status.replace(/_/g, " ")}</AppBadge>;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const copy = {
  en: {
    title: "Hero Images",
    description: "Prepare reference-ready hero images for each Flow Scene before prompting in Google Flow.",
    emptyTitle: "Import or create a Flow Project first.",
    emptyDescription: "Hero images are managed per scene after a project has scenes.",
    goImport: "Go to Multimodal Import",
    projectLabel: "Flow Project",
    sceneLabel: "Flow Scene",
    noProject: "No project selected.",
    noScene: "No scene selected.",
    sceneCoverage: "Scene Coverage",
    noSceneTitle: "No scenes available.",
    noSceneDescription: "Create scenes through Multimodal Import, Storyboard, or Flow Scenes first.",
    currentScene: "Current Scene",
    referenceImage: "Reference Image",
    uploadImage: "Import Hero Image Reference",
    uploadHelp: "Use the image you want Google Flow to treat as the visual anchor for this scene.",
    statusLabel: "Hero Image Status",
    promptLabel: "Hero Image Prompt",
    save: "Save Hero Image",
    copyPrompt: "Copy Prompt",
    saved: "Hero image reference saved.",
  },
  "zh-TW": {
    title: "主視覺圖片",
    description: "在送入 Google Flow 前，為每個 Flow 場景準備可作為參考的主視覺圖片。",
    emptyTitle: "請先匯入或建立 Flow 專案。",
    emptyDescription: "專案有場景後，就可以逐場管理主視覺圖片。",
    goImport: "前往多模態匯入",
    projectLabel: "Flow 專案",
    sceneLabel: "Flow 場景",
    noProject: "尚未選擇專案。",
    noScene: "尚未選擇場景。",
    sceneCoverage: "場景覆蓋狀態",
    noSceneTitle: "目前沒有場景。",
    noSceneDescription: "請先透過多模態匯入、Flow 分鏡或 Flow 場景建立 scenes。",
    currentScene: "目前場景",
    referenceImage: "參考圖片",
    uploadImage: "匯入主視覺參考圖",
    uploadHelp: "使用你希望 Google Flow 作為此場景視覺錨點的圖片。",
    statusLabel: "主視覺狀態",
    promptLabel: "主視覺提示詞",
    save: "儲存主視覺",
    copyPrompt: "複製提示詞",
    saved: "已儲存主視覺參考。",
  },
} as const;