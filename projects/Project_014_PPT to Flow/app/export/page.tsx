"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clipboard, Download, FileJson, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { FormSelect } from "@/components/ui/FormSelect";
import { db } from "@/lib/db";
import type { FlowProject, FlowScene } from "@/lib/types/flow";
import { useLanguage } from "@/lib/i18n";

type HeroScene = FlowScene & {
  heroImageReferenceName?: string;
  endingFrameReferenceName?: string;
};

type CharacterReference = {
  name: string;
  role: string;
  visualRules: string;
  continuityNotes: string;
  imageName?: string;
};

type ExportBundle = {
  project: FlowProject;
  scenes: HeroScene[];
  characters: CharacterReference[];
  markdown: string;
  json: string;
};

export default function ExportPage() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [projects, setProjects] = useState<FlowProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [scenes, setScenes] = useState<HeroScene[]>([]);
  const [characters, setCharacters] = useState<CharacterReference[]>([]);
  const [copied, setCopied] = useState<"markdown" | "json" | null>(null);

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
        setCharacters([]);
        return;
      }

      const [loadedScenes, bible] = await Promise.all([
        db.flowScenes.where("projectId").equals(selectedProjectId).sortBy("sceneNumber"),
        db.projectBibles.where("projectId").equals(selectedProjectId).first(),
      ]);

      setScenes(loadedScenes as HeroScene[]);
      setCharacters(parseCharacters(bible?.characterBible));
    }

    void loadProjectData();
  }, [selectedProjectId]);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const bundle = useMemo(
    () => (selectedProject ? createExportBundle(selectedProject, scenes, characters) : null),
    [selectedProject, scenes, characters],
  );

  const projectOptions = projects.map((project) => project.id);
  const projectLabels = Object.fromEntries(projects.map((project) => [project.id, project.name]));

  const copyToClipboard = async (kind: "markdown" | "json") => {
    if (!bundle) return;
    await navigator.clipboard.writeText(kind === "markdown" ? bundle.markdown : bundle.json);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1600);
  };

  const downloadFile = (kind: "markdown" | "json") => {
    if (!bundle) return;
    const content = kind === "markdown" ? bundle.markdown : bundle.json;
    const extension = kind === "markdown" ? "md" : "json";
    const mimeType = kind === "markdown" ? "text/markdown" : "application/json";
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(bundle.project.name)}-google-flow-package.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
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
        <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <aside className="space-y-4">
            <AppCard>
              <FormSelect
                label={labels.projectLabel}
                value={selectedProjectId}
                options={projectOptions}
                onChange={setSelectedProjectId}
              />
              <p className="mt-3 text-sm leading-6 text-muted">
                {selectedProjectId ? projectLabels[selectedProjectId] : labels.noProject}
              </p>
            </AppCard>

            <AppCard>
              <h2 className="card-title">{labels.packageTitle}</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
                <p>{labels.sceneCount(scenes.length)}</p>
                <p>{labels.characterCount(characters.length)}</p>
                <p>{labels.packageIncludes}</p>
              </div>
              <div className="mt-6 grid gap-3">
                <AppButton type="button" onClick={() => copyToClipboard("markdown")} disabled={!bundle}>
                  {copied === "markdown" ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  {labels.copyMarkdown}
                </AppButton>
                <AppButton type="button" variant="outline" onClick={() => downloadFile("markdown")} disabled={!bundle}>
                  <Download className="h-4 w-4" />
                  {labels.downloadMarkdown}
                </AppButton>
                <AppButton type="button" variant="outline" onClick={() => copyToClipboard("json")} disabled={!bundle}>
                  {copied === "json" ? <Check className="h-4 w-4" /> : <FileJson className="h-4 w-4" />}
                  {labels.copyJson}
                </AppButton>
              </div>
            </AppCard>
          </aside>

          <section className="space-y-4">
            <AppCard>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="card-title">{labels.previewTitle}</h2>
              </div>
              <pre className="mt-5 max-h-[42rem] overflow-auto rounded-app border border-border bg-background p-4 text-xs leading-6 text-textSecondary whitespace-pre-wrap">
                {bundle?.markdown ?? labels.noPreview}
              </pre>
            </AppCard>
          </section>
        </div>
      )}
    </div>
  );
}

function createExportBundle(
  project: FlowProject,
  scenes: HeroScene[],
  characters: CharacterReference[],
): ExportBundle {
  const exportScenes = scenes.map((scene) => ({
    sceneNumber: scene.sceneNumber,
    title: scene.title,
    durationSec: scene.durationSec,
    storyBeat: scene.storyBeat,
    emotion: scene.emotion,
    camera: scene.camera,
    heroImageReferenceName: scene.heroImageReferenceName,
    heroImagePrompt: scene.heroImagePrompt,
    googleFlowPrompt: scene.flowAnimationPrompt,
    voiceOver: scene.voiceOver,
    subtitle: scene.subtitle,
    music: scene.music,
    sfx: scene.sfx,
    continuityNote: scene.continuityNote,
    endingFrameReferenceName: scene.endingFrameReferenceName,
    endingFrameNote: scene.endingFrameNote,
    qa: {
      sceneHealthScore: scene.sceneHealthScore,
      flowReadyScore: scene.flowReadyScore,
      heroImageStatus: scene.heroImageStatus,
      flowPromptStatus: scene.flowPromptStatus,
      endingFrameStatus: scene.endingFrameStatus,
    },
  }));

  const markdown = [
    `# ${project.name} - Google Flow Package`,
    "",
    `Brand: ${project.brandName || "Imported Source"}`,
    `Audience: ${project.targetAudience || "Google Flow production audience"}`,
    `Language: ${project.language}`,
    `Target Duration: ${project.targetDurationSec}s`,
    `Scene Count: ${scenes.length}`,
    "",
    "## How to Use in Google Flow",
    "",
    "1. Use Character References as identity and continuity anchors.",
    "2. For each scene, create or upload the Hero Image reference using the Hero Image Prompt.",
    "3. Paste the Google Flow Prompt into Google Flow for that scene.",
    "4. Add Voice Over and Subtitle text if the scene needs audio or captions.",
    "5. Use the Ending Frame Note as the visual bridge into the next scene.",
    "",
    "## Character References",
    "",
    ...(characters.length > 0
      ? characters.flatMap((character) => [
          `### ${character.name}`,
          "",
          `Role: ${character.role || "Not specified."}`,
          `Image Reference: ${character.imageName || "Not provided."}`,
          "",
          "Visual Rules:",
          character.visualRules || "Not provided.",
          "",
          "Continuity Notes:",
          character.continuityNotes || "Not provided.",
          "",
        ])
      : ["No character references provided.", ""]),
    "## Scenes",
    "",
    ...scenes.flatMap((scene) => [
      `### Scene ${scene.sceneNumber}: ${scene.title}`,
      "",
      `Duration: ${scene.durationSec}s`,
      `Beat: ${scene.storyBeat}`,
      `Emotion: ${scene.emotion}`,
      `Camera: ${scene.camera}`,
      "",
      "#### Hero Image Prompt",
      scene.heroImagePrompt || "Not provided.",
      "",
      "#### Google Flow Prompt",
      scene.flowAnimationPrompt || "Not provided.",
      "",
      "#### Voice Over",
      scene.voiceOver || "Not provided.",
      "",
      "#### Subtitle",
      scene.subtitle || "Not provided.",
      "",
      "#### Continuity Note",
      scene.continuityNote || "Maintain project style and subject continuity.",
      "",
      "#### Ending Frame Note",
      scene.endingFrameNote || "Use the final frame to bridge into the next scene.",
      "",
      "#### QA Checklist",
      `- Scene Health Score: ${scene.sceneHealthScore}`,
      `- Flow Ready Score: ${scene.flowReadyScore}`,
      `- Hero Image Status: ${scene.heroImageStatus}`,
      `- Flow Prompt Status: ${scene.flowPromptStatus}`,
      `- Ending Frame Status: ${scene.endingFrameStatus}`,
      "",
    ]),
  ].join("\n");

  const json = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        brandName: project.brandName,
        targetAudience: project.targetAudience,
        targetDurationSec: project.targetDurationSec,
        targetSceneCount: project.targetSceneCount,
        language: project.language,
        flowStatus: project.flowStatus,
      },
      characters,
      scenes: exportScenes,
    },
    null,
    2,
  );

  return { project, scenes, characters, markdown, json };
}

function parseCharacters(value?: string) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as CharacterReference[];
    return Array.isArray(parsed)
      ? parsed.map((character) => ({
          name: character.name,
          role: character.role,
          visualRules: character.visualRules,
          continuityNotes: character.continuityNotes,
          imageName: character.imageName,
        }))
      : [];
  } catch {
    return [];
  }
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "google-flow-package"
  );
}

const copy = {
  en: {
    title: "Flow Export",
    description: "Export a Google Flow-ready package from the imported project, character references, storyboard, and scenes.",
    emptyTitle: "Import or create a Flow Project first.",
    emptyDescription: "Once a project has scenes, this page generates the prompts and handoff data for Google Flow.",
    goImport: "Go to Multimodal Import",
    projectLabel: "Flow Project",
    noProject: "No project selected.",
    packageTitle: "Export Package",
    packageIncludes: "Includes character references, Hero Image Prompt, Google Flow Prompt, voice over, subtitles, continuity notes, ending frame notes, and QA checks.",
    copyMarkdown: "Copy Markdown",
    downloadMarkdown: "Download Markdown",
    copyJson: "Copy JSON",
    previewTitle: "Google Flow handoff preview",
    noPreview: "Select a project to preview its export package.",
    sceneCount: (count: number) => `${count} scene${count === 1 ? "" : "s"} ready for export.`,
    characterCount: (count: number) => `${count} character reference${count === 1 ? "" : "s"}.`,
  },
  "zh-TW": {
    title: "Flow 匯出",
    description: "從已匯入的專案、角色參考、分鏡與場景產出可交給 Google Flow 使用的資料包。",
    emptyTitle: "請先匯入或建立 Flow 專案。",
    emptyDescription: "專案有場景後，這裡會產出給 Google Flow 使用的提示詞與交付資料。",
    goImport: "前往多模態匯入",
    projectLabel: "Flow 專案",
    noProject: "尚未選擇專案。",
    packageTitle: "匯出資料包",
    packageIncludes: "包含角色參考、Hero Image Prompt、Google Flow Prompt、旁白、字幕、連續性備註、結尾畫面備註與 QA 檢查。",
    copyMarkdown: "複製 Markdown",
    downloadMarkdown: "下載 Markdown",
    copyJson: "複製 JSON",
    previewTitle: "Google Flow 交付預覽",
    noPreview: "選擇專案後即可預覽匯出資料。",
    sceneCount: (count: number) => `${count} 個場景可匯出。`,
    characterCount: (count: number) => `${count} 個角色參考。`,
  },
} as const;