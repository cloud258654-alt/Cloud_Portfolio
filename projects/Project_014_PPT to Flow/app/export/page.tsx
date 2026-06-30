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

type ExportScope = "project" | "scene";
type ExportFormat = "markdown" | "json";
type StoredSettings = {
  defaultExportFormat?: ExportFormat;
  defaultExportScope?: ExportScope;
};

const settingsKey = "flow-director-settings";

export default function ExportPage() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [projects, setProjects] = useState<FlowProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [scenes, setScenes] = useState<HeroScene[]>([]);
  const [characters, setCharacters] = useState<CharacterReference[]>([]);
  const [exportScope, setExportScope] = useState<ExportScope>("project");
  const [defaultExportFormat, setDefaultExportFormat] = useState<ExportFormat>("markdown");
  const [selectedSceneId, setSelectedSceneId] = useState("");
  const [copied, setCopied] = useState<"markdown" | "json" | null>(null);

  useEffect(() => {
    const storedSettings = getStoredSettings();
    if (storedSettings.defaultExportScope) setExportScope(storedSettings.defaultExportScope);
    if (storedSettings.defaultExportFormat) setDefaultExportFormat(storedSettings.defaultExportFormat);

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
      setSelectedSceneId((current) => {
        if (loadedScenes.some((scene) => scene.id === current)) return current;
        return loadedScenes.at(0)?.id || "";
      });
    }

    void loadProjectData();
  }, [selectedProjectId]);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const selectedScene = scenes.find((scene) => scene.id === selectedSceneId) ?? null;
  const exportScenes = exportScope === "scene" && selectedScene ? [selectedScene] : scenes;
  const bundle = useMemo(
    () =>
      selectedProject
        ? createExportBundle(selectedProject, exportScenes, characters, exportScope)
        : null,
    [selectedProject, exportScenes, characters, exportScope],
  );

  const projectOptions = projects.map((project) => project.id);
  const projectLabels = Object.fromEntries(projects.map((project) => [project.id, project.name]));
  const sceneOptions = scenes.map((scene) => scene.id);
  const sceneLabels = Object.fromEntries(
    scenes.map((scene) => [scene.id, `${scene.sceneNumber}. ${scene.title}`]),
  );

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
    const sceneSuffix =
      exportScope === "scene" && selectedScene
        ? `-scene-${selectedScene.sceneNumber}-${slugify(selectedScene.title)}`
        : "";
    link.href = url;
    link.download = `${slugify(bundle.project.name)}${sceneSuffix}-google-flow-package.${extension}`;
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
                onChange={(value) => {
                  setSelectedProjectId(value);
                  setSelectedSceneId("");
                }}
              />
              <p className="mt-3 text-sm leading-6 text-muted">
                {selectedProjectId ? projectLabels[selectedProjectId] : labels.noProject}
              </p>
            </AppCard>

            <AppCard>
              <SelectField
                label={labels.scopeLabel}
                value={exportScope}
                options={[
                  { value: "project", label: labels.scopeProject },
                  { value: "scene", label: labels.scopeScene },
                ]}
                onChange={(value) => setExportScope(value as ExportScope)}
              />
              {exportScope === "scene" ? (
                <div className="mt-4">
                  <SelectField
                    label={labels.sceneLabel}
                    value={selectedSceneId}
                    options={sceneOptions.map((sceneId) => ({
                      value: sceneId,
                      label: sceneLabels[sceneId] ?? sceneId,
                    }))}
                    onChange={setSelectedSceneId}
                  />
                </div>
              ) : null}
              <p className="mt-3 text-sm leading-6 text-muted">
                {exportScope === "scene"
                  ? selectedScene
                    ? labels.sceneScopeHelp(selectedScene.sceneNumber)
                    : labels.noScene
                  : labels.projectScopeHelp}
              </p>
            </AppCard>

            <AppCard>
              <h2 className="card-title">{labels.packageTitle}</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
                <p>{labels.sceneCount(exportScenes.length)}</p>
                <p>{labels.characterCount(characters.length)}</p>
                <p>{labels.packageIncludes}</p>
              </div>
              <div className="mt-6 grid gap-3">
                <p className="text-sm leading-6 text-muted">
                  {labels.defaultFormat(defaultExportFormat)}
                </p>
                <AppButton type="button" onClick={() => copyToClipboard(defaultExportFormat)} disabled={!bundle}>
                  {copied === defaultExportFormat ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  {labels.copyDefault(defaultExportFormat)}
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
  scope: ExportScope = "project",
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
    `# ${project.name} - ${scope === "scene" ? "Google Flow Scene Package" : "Google Flow Package"}`,
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
      exportScope: scope,
      scenes: exportScenes,
    },
    null,
    2,
  );

  return { project, scenes, characters, markdown, json };
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

function getStoredSettings(): StoredSettings {
  try {
    return JSON.parse(window.localStorage.getItem(settingsKey) ?? "{}") as StoredSettings;
  } catch {
    return {};
  }
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
    scopeLabel: "Export Scope",
    scopeProject: "Full Project",
    scopeScene: "Single Scene",
    sceneLabel: "Scene",
    noScene: "No scene selected.",
    projectScopeHelp: "Export the full project summary with every scene.",
    sceneScopeHelp: (sceneNumber: number) => `Export Scene ${sceneNumber} as an independent Google Flow package.`,
    defaultFormat: (format: string) => `Default format from Settings: ${format}.`,
    copyDefault: (format: string) => `Copy Default ${format.toUpperCase()}`,
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
    scopeLabel: "匯出範圍",
    scopeProject: "全片總表",
    scopeScene: "單一 Scene",
    sceneLabel: "Scene",
    noScene: "尚未選擇 Scene。",
    projectScopeHelp: "匯出整個專案總表，包含所有場景。",
    sceneScopeHelp: (sceneNumber: number) => `將 Scene ${sceneNumber} 獨立匯出成 Google Flow 資料包。`,
    defaultFormat: (format: string) => `設定頁預設格式：${format}。`,
    copyDefault: (format: string) => `複製預設 ${format.toUpperCase()}`,
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
