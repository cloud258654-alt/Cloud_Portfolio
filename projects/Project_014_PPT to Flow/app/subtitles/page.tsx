"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Captions, Clipboard, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { db } from "@/lib/db";
import { calculateSceneHealthScore } from "@/lib/engines/sceneHealthEngine";
import type { FlowProject, FlowScene } from "@/lib/types/flow";
import { useLanguage } from "@/lib/i18n";

type SubtitleForm = {
  subtitle: string;
};

const emptyForm: SubtitleForm = {
  subtitle: "",
};

export default function SubtitlesPage() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [projects, setProjects] = useState<FlowProject[]>([]);
  const [scenes, setScenes] = useState<FlowScene[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedSceneId, setSelectedSceneId] = useState("");
  const [form, setForm] = useState<SubtitleForm>(emptyForm);
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
    async function loadScenes() {
      if (!selectedProjectId) {
        setScenes([]);
        setSelectedSceneId("");
        return;
      }

      const loadedScenes = await db.flowScenes
        .where("projectId")
        .equals(selectedProjectId)
        .sortBy("sceneNumber");

      setScenes(loadedScenes);
      setSelectedSceneId((current) => {
        if (loadedScenes.some((scene) => scene.id === current)) return current;
        return loadedScenes.at(0)?.id || "";
      });
    }

    void loadScenes();
  }, [selectedProjectId]);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedSceneId) ?? null,
    [scenes, selectedSceneId],
  );

  useEffect(() => {
    if (!selectedScene) {
      setForm(emptyForm);
      return;
    }

    setForm({ subtitle: selectedScene.subtitle });
  }, [selectedScene]);

  const selectedTiming = selectedScene ? getSceneTiming(scenes, selectedScene.id) : null;
  const writtenCount = scenes.filter((scene) => scene.subtitle.trim()).length;
  const totalDuration = scenes.reduce((sum, scene) => sum + scene.durationSec, 0);
  const readingSpeed = selectedScene
    ? calculateReadingSpeed(form.subtitle, selectedScene.durationSec)
    : 0;
  const sceneSrt =
    selectedScene && selectedTiming
      ? formatSrtBlock(1, selectedTiming.startSec, selectedTiming.endSec, form.subtitle || labels.emptyValue)
      : "";
  const projectSrt = formatProjectSrt(
    scenes.map((scene) =>
      scene.id === selectedSceneId ? { ...scene, subtitle: form.subtitle } : scene,
    ),
    labels.emptyValue,
  );

  const saveSubtitle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProjectId || !selectedScene) {
      setMessage(labels.needScene);
      return;
    }

    const now = new Date().toISOString();
    const subtitle = form.subtitle.trim();
    const sceneDraft = { ...selectedScene, subtitle, updatedAt: now };
    const sceneHealthScore = calculateSceneHealthScore(sceneDraft);

    await db.flowScenes.update(selectedScene.id, {
      subtitle,
      sceneHealthScore,
      updatedAt: now,
    });

    const nextScenes = await db.flowScenes
      .where("projectId")
      .equals(selectedProjectId)
      .sortBy("sceneNumber");
    setScenes(nextScenes);
    setMessage(labels.saved(selectedScene.sceneNumber));
  };

  const copySceneSrt = async () => {
    if (!sceneSrt) return;
    await navigator.clipboard.writeText(sceneSrt);
    setMessage(labels.copiedScene);
  };

  const copyProjectSrt = async () => {
    await navigator.clipboard.writeText(projectSrt);
    setMessage(labels.copiedProject);
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
                <Captions className="h-5 w-5 text-accent" aria-hidden="true" />
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
                      <p className="mt-1 text-xs text-muted">
                        {scene.subtitle.trim() ? labels.hasSubtitle : labels.noSubtitle}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </AppCard>
          </aside>

          <section>
            {selectedScene ? (
              <AppCard>
                <div>
                  <p className="caption-text">{labels.subtitleLines}</p>
                  <h2 className="section-title mt-1">
                    {labels.sceneNumber(selectedScene.sceneNumber)} {selectedScene.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {selectedTiming
                      ? labels.timing(formatTimestamp(selectedTiming.startSec), formatTimestamp(selectedTiming.endSec))
                      : labels.noTiming}
                  </p>
                </div>

                <form className="mt-6 space-y-5" onSubmit={saveSubtitle}>
                  <FormTextarea
                    label={labels.subtitle}
                    value={form.subtitle}
                    onChange={(subtitle) => setForm({ subtitle })}
                  />

                  <div className="grid gap-3 md:grid-cols-3">
                    <Metric label={labels.duration} value={`${selectedScene.durationSec}s`} />
                    <Metric label={labels.readingSpeed} value={`${readingSpeed} ${labels.charsPerSecond}`} />
                    <Metric label={labels.lineCount} value={`${countSubtitleLines(form.subtitle)}`} />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <AppButton type="submit">
                      <Save className="h-4 w-4" aria-hidden="true" />
                      {labels.save}
                    </AppButton>
                    <AppButton type="button" variant="outline" onClick={copySceneSrt}>
                      <Clipboard className="h-4 w-4" aria-hidden="true" />
                      {labels.copyScene}
                    </AppButton>
                    <AppButton type="button" variant="outline" onClick={copyProjectSrt}>
                      <Clipboard className="h-4 w-4" aria-hidden="true" />
                      {labels.copyProject}
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
              <h2 className="card-title">{labels.srtExport}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric label={labels.written} value={`${writtenCount}/${scenes.length}`} />
                <Metric label={labels.totalTime} value={`${totalDuration}s`} />
              </div>
            </AppCard>

            <AppCard>
              <h2 className="card-title">{labels.scenePreview}</h2>
              <pre className="mt-4 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-radius-sm border border-border bg-background p-3 text-sm leading-6 text-muted">
                {sceneSrt || labels.emptyValue}
              </pre>
            </AppCard>

            <AppCard>
              <h2 className="card-title">{labels.projectPreview}</h2>
              <pre className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-radius-sm border border-border bg-background p-3 text-sm leading-6 text-muted">
                {projectSrt || labels.emptyValue}
              </pre>
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

function getSceneTiming(scenes: FlowScene[], sceneId: string) {
  let cursor = 0;
  for (const scene of scenes) {
    const startSec = cursor;
    const endSec = cursor + scene.durationSec;
    if (scene.id === sceneId) return { startSec, endSec };
    cursor = endSec;
  }
  return null;
}

function formatProjectSrt(scenes: FlowScene[], emptyValue: string) {
  let cursor = 0;
  return scenes
    .map((scene, index) => {
      const startSec = cursor;
      const endSec = cursor + scene.durationSec;
      cursor = endSec;
      return formatSrtBlock(index + 1, startSec, endSec, scene.subtitle || emptyValue);
    })
    .join("\n\n");
}

function formatSrtBlock(index: number, startSec: number, endSec: number, text: string) {
  return [index, `${formatTimestamp(startSec)} --> ${formatTimestamp(endSec)}`, text].join("\n");
}

function formatTimestamp(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},000`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function countSubtitleLines(value: string) {
  return value.split(/\r?\n/).filter((line) => line.trim()).length;
}

function calculateReadingSpeed(value: string, durationSec: number) {
  if (durationSec <= 0) return 0;
  const characterCount = value.replace(/\s/g, "").length;
  return Number((characterCount / durationSec).toFixed(1));
}

const copy = {
  en: {
    title: "Subtitles",
    description: "Prepare subtitle lines, reading speed, timestamps, and SRT content for the Flow Export Package.",
    emptyProjectTitle: "Create or import a Flow Project first.",
    emptyProjectDescription: "Subtitles are written per scene and can be exported as SRT content.",
    goImport: "Go to Multimodal Import",
    projectLabel: "Flow Project",
    noBrand: "No brand specified.",
    sceneList: "Scenes",
    emptySceneTitle: "Create Flow Scenes first.",
    emptySceneDescription: "Scenes from the storyboard will appear here for subtitle writing.",
    goStoryboard: "Go to Flow Storyboard",
    subtitleLines: "Subtitle Lines",
    sceneNumber: (sceneNumber: number) => `Scene ${sceneNumber}`,
    timing: (start: string, end: string) => `${start} to ${end}`,
    noTiming: "No timing available.",
    subtitle: "Subtitle Text",
    duration: "Duration",
    readingSpeed: "Reading Speed",
    charsPerSecond: "chars/s",
    lineCount: "Lines",
    save: "Save Subtitle",
    copyScene: "Copy Scene SRT",
    copyProject: "Copy Project SRT",
    needScene: "Select a scene first.",
    saved: (sceneNumber: number) => `Saved subtitles for Scene ${sceneNumber}.`,
    copiedScene: "Scene SRT copied.",
    copiedProject: "Project SRT copied.",
    hasSubtitle: "Subtitle written",
    noSubtitle: "No subtitle yet",
    srtExport: "SRT Export",
    written: "Written",
    totalTime: "Total Time",
    scenePreview: "Scene SRT Preview",
    projectPreview: "Project SRT Preview",
    emptyValue: "Not provided.",
  },
  "zh-TW": {
    title: "字幕",
    description: "準備字幕行、閱讀速度、時間戳與 Flow 匯出套件所需的 SRT 內容。",
    emptyProjectTitle: "請先建立或匯入 Flow 專案。",
    emptyProjectDescription: "字幕會依場景撰寫，並可匯出成 SRT 內容。",
    goImport: "前往多模態匯入",
    projectLabel: "Flow 專案",
    noBrand: "尚未指定品牌。",
    sceneList: "場景",
    emptySceneTitle: "請先建立 Flow 場景。",
    emptySceneDescription: "分鏡中的場景會出現在這裡，供你撰寫字幕。",
    goStoryboard: "前往 Flow 分鏡",
    subtitleLines: "字幕行",
    sceneNumber: (sceneNumber: number) => `場景 ${sceneNumber}`,
    timing: (start: string, end: string) => `${start} 到 ${end}`,
    noTiming: "尚無時間設定。",
    subtitle: "字幕文字",
    duration: "長度",
    readingSpeed: "閱讀速度",
    charsPerSecond: "字/秒",
    lineCount: "行數",
    save: "儲存字幕",
    copyScene: "複製本場 SRT",
    copyProject: "複製全片 SRT",
    needScene: "請先選擇場景。",
    saved: (sceneNumber: number) => `已儲存場景 ${sceneNumber} 的字幕。`,
    copiedScene: "已複製本場 SRT。",
    copiedProject: "已複製全片 SRT。",
    hasSubtitle: "已撰寫字幕",
    noSubtitle: "尚未撰寫字幕",
    srtExport: "SRT 匯出",
    written: "已撰寫",
    totalTime: "總時間",
    scenePreview: "本場 SRT 預覽",
    projectPreview: "全片 SRT 預覽",
    emptyValue: "尚未提供。",
  },
} as const;
