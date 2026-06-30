"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Clipboard, Mic2, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { db } from "@/lib/db";
import { calculateSceneHealthScore } from "@/lib/engines/sceneHealthEngine";
import type { ProjectBible } from "@/lib/types/bible";
import type { FlowProject, FlowScene } from "@/lib/types/flow";
import { useLanguage } from "@/lib/i18n";

type VoiceNotes = {
  sceneId: string;
  pacingNotes: string;
  pronunciationGuidance: string;
  timingNotes: string;
  updatedAt: string;
};

type VoiceForm = {
  voiceOver: string;
  pacingNotes: string;
  pronunciationGuidance: string;
  timingNotes: string;
};

type AudioBibleData = {
  audioRules: string;
  voiceNotes: VoiceNotes[];
};

const emptyForm: VoiceForm = {
  voiceOver: "",
  pacingNotes: "",
  pronunciationGuidance: "",
  timingNotes: "",
};

export default function VoicePage() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [projects, setProjects] = useState<FlowProject[]>([]);
  const [scenes, setScenes] = useState<FlowScene[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNotes[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedSceneId, setSelectedSceneId] = useState("");
  const [form, setForm] = useState<VoiceForm>(emptyForm);
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
        setVoiceNotes([]);
        setSelectedSceneId("");
        return;
      }

      const [loadedScenes, bible] = await Promise.all([
        db.flowScenes.where("projectId").equals(selectedProjectId).sortBy("sceneNumber"),
        db.projectBibles.where("projectId").equals(selectedProjectId).first(),
      ]);

      setScenes(loadedScenes);
      setVoiceNotes(parseVoiceNotes(bible?.audioBible));
      setSelectedSceneId((current) => {
        if (loadedScenes.some((scene) => scene.id === current)) return current;
        return loadedScenes.at(0)?.id || "";
      });
    }

    void loadProjectData();
  }, [selectedProjectId]);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedSceneId) ?? null,
    [scenes, selectedSceneId],
  );
  const selectedNotes = useMemo(
    () => voiceNotes.find((notes) => notes.sceneId === selectedSceneId) ?? null,
    [selectedSceneId, voiceNotes],
  );

  useEffect(() => {
    if (!selectedScene) {
      setForm(emptyForm);
      return;
    }

    setForm({
      voiceOver: selectedScene.voiceOver,
      pacingNotes: selectedNotes?.pacingNotes ?? "",
      pronunciationGuidance: selectedNotes?.pronunciationGuidance ?? "",
      timingNotes: selectedNotes?.timingNotes ?? "",
    });
  }, [selectedNotes, selectedScene]);

  const writtenCount = scenes.filter((scene) => scene.voiceOver.trim()).length;
  const totalSeconds = scenes.reduce((sum, scene) => sum + scene.durationSec, 0);

  const saveVoice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProjectId || !selectedScene) {
      setMessage(labels.needScene);
      return;
    }

    const now = new Date().toISOString();
    const voiceOver = form.voiceOver.trim();
    const sceneDraft = { ...selectedScene, voiceOver, updatedAt: now };
    const sceneHealthScore = calculateSceneHealthScore(sceneDraft);

    await db.flowScenes.update(selectedScene.id, {
      voiceOver,
      sceneHealthScore,
      updatedAt: now,
    });

    const nextNotes = upsertVoiceNotes(voiceNotes, {
      sceneId: selectedScene.id,
      pacingNotes: form.pacingNotes.trim(),
      pronunciationGuidance: form.pronunciationGuidance.trim(),
      timingNotes: form.timingNotes.trim(),
      updatedAt: now,
    });

    await saveAudioBible(selectedProjectId, nextNotes, now);

    const nextScenes = await db.flowScenes
      .where("projectId")
      .equals(selectedProjectId)
      .sortBy("sceneNumber");
    setScenes(nextScenes);
    setVoiceNotes(nextNotes);
    setMessage(labels.saved(selectedScene.sceneNumber));
  };

  const copyVoicePackage = async () => {
    if (!selectedScene) return;

    await navigator.clipboard.writeText(
      [
        `# ${labels.sceneNumber(selectedScene.sceneNumber)} ${selectedScene.title}`,
        "",
        `## ${labels.voiceOver}`,
        form.voiceOver || labels.emptyValue,
        "",
        `## ${labels.pacingNotes}`,
        form.pacingNotes || labels.emptyValue,
        "",
        `## ${labels.pronunciationGuidance}`,
        form.pronunciationGuidance || labels.emptyValue,
        "",
        `## ${labels.timingNotes}`,
        form.timingNotes || labels.emptyValue,
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
                <Mic2 className="h-5 w-5 text-accent" aria-hidden="true" />
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
                        {scene.voiceOver.trim() ? labels.hasVoice : labels.noVoice}
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
                  <p className="caption-text">{labels.voiceDraft}</p>
                  <h2 className="section-title mt-1">
                    {labels.sceneNumber(selectedScene.sceneNumber)} {selectedScene.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {labels.duration(selectedScene.durationSec)}
                  </p>
                </div>

                <form className="mt-6 space-y-5" onSubmit={saveVoice}>
                  <FormTextarea
                    label={labels.voiceOver}
                    value={form.voiceOver}
                    onChange={(voiceOver) => setForm({ ...form, voiceOver })}
                  />
                  <FormTextarea
                    label={labels.pacingNotes}
                    value={form.pacingNotes}
                    onChange={(pacingNotes) => setForm({ ...form, pacingNotes })}
                  />
                  <FormTextarea
                    label={labels.pronunciationGuidance}
                    value={form.pronunciationGuidance}
                    onChange={(pronunciationGuidance) =>
                      setForm({ ...form, pronunciationGuidance })
                    }
                  />
                  <FormTextarea
                    label={labels.timingNotes}
                    value={form.timingNotes}
                    onChange={(timingNotes) => setForm({ ...form, timingNotes })}
                  />

                  <div className="flex flex-wrap gap-3">
                    <AppButton type="submit">
                      <Save className="h-4 w-4" aria-hidden="true" />
                      {labels.save}
                    </AppButton>
                    <AppButton type="button" variant="outline" onClick={copyVoicePackage}>
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
              <h2 className="card-title">{labels.flowPackage}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric label={labels.written} value={`${writtenCount}/${scenes.length}`} />
                <Metric label={labels.totalTime} value={`${totalSeconds}s`} />
              </div>
            </AppCard>

            <AppCard>
              <h2 className="card-title">{labels.previewTitle}</h2>
              <PreviewBlock label={labels.voiceOver} value={form.voiceOver} emptyValue={labels.emptyValue} />
              <PreviewBlock label={labels.pacingNotes} value={form.pacingNotes} emptyValue={labels.emptyValue} />
              <PreviewBlock label={labels.pronunciationGuidance} value={form.pronunciationGuidance} emptyValue={labels.emptyValue} />
              <PreviewBlock label={labels.timingNotes} value={form.timingNotes} emptyValue={labels.emptyValue} />
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

function parseVoiceNotes(value?: string) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as VoiceNotes[] | Partial<AudioBibleData>;
    if (Array.isArray(parsed)) return parsed;
    return Array.isArray(parsed.voiceNotes) ? parsed.voiceNotes : [];
  } catch {
    return [];
  }
}

function upsertVoiceNotes(notes: VoiceNotes[], nextNote: VoiceNotes) {
  const exists = notes.some((note) => note.sceneId === nextNote.sceneId);
  return exists
    ? notes.map((note) => (note.sceneId === nextNote.sceneId ? nextNote : note))
    : [...notes, nextNote];
}

async function saveAudioBible(projectId: string, voiceNotes: VoiceNotes[], now: string) {
  const existing = await db.projectBibles.where("projectId").equals(projectId).first();
  const audioBible = JSON.stringify({
    audioRules: parseAudioBible(existing?.audioBible).audioRules,
    voiceNotes,
  });

  if (existing) {
    await db.projectBibles.update(existing.id, { audioBible, updatedAt: now });
  } else {
    await db.projectBibles.add(createProjectBible(projectId, audioBible, now));
  }
}

function parseAudioBible(value?: string): AudioBibleData {
  if (!value) return { audioRules: "", voiceNotes: [] };
  try {
    const parsed = JSON.parse(value) as VoiceNotes[] | Partial<AudioBibleData>;
    if (Array.isArray(parsed)) return { audioRules: "", voiceNotes: parsed };
    return {
      audioRules: typeof parsed.audioRules === "string" ? parsed.audioRules : "",
      voiceNotes: Array.isArray(parsed.voiceNotes) ? parsed.voiceNotes : [],
    };
  } catch {
    return { audioRules: value, voiceNotes: [] };
  }
}

function createProjectBible(projectId: string, audioBible: string, now: string): ProjectBible {
  return {
    id: crypto.randomUUID(),
    projectId,
    brandBible: "",
    characterBible: "",
    vehicleBible: "",
    environmentBible: "",
    cameraBible: "",
    lightingBible: "",
    colorBible: "",
    audioBible,
    motionBible: "",
    emotionBible: "",
    negativePromptBible: "",
    createdAt: now,
    updatedAt: now,
  };
}

const copy = {
  en: {
    title: "Voice Over",
    description: "Draft voice over copy, pacing notes, pronunciation guidance, and timing for each Flow Scene.",
    emptyProjectTitle: "Create or import a Flow Project first.",
    emptyProjectDescription: "Voice over copy is written per scene and included in the export package.",
    goImport: "Go to Multimodal Import",
    projectLabel: "Flow Project",
    noBrand: "No brand specified.",
    sceneList: "Scenes",
    emptySceneTitle: "Create Flow Scenes first.",
    emptySceneDescription: "Scenes from the storyboard will appear here for voice over writing.",
    goStoryboard: "Go to Flow Storyboard",
    voiceDraft: "Voice Draft",
    sceneNumber: (sceneNumber: number) => `Scene ${sceneNumber}`,
    duration: (durationSec: number) => `Target duration: ${durationSec}s`,
    voiceOver: "Voice Over Copy",
    pacingNotes: "Pacing Notes",
    pronunciationGuidance: "Pronunciation Guidance",
    timingNotes: "Timing Notes",
    save: "Save Voice Over",
    copy: "Copy Voice Package",
    needScene: "Select a scene first.",
    saved: (sceneNumber: number) => `Saved voice over for Scene ${sceneNumber}.`,
    copied: "Voice package copied.",
    hasVoice: "Voice over written",
    noVoice: "No voice over yet",
    flowPackage: "Flow Package",
    written: "Written",
    totalTime: "Total Time",
    previewTitle: "Voice Preview",
    emptyValue: "Not provided.",
  },
  "zh-TW": {
    title: "旁白",
    description: "為每個 Flow 場景撰寫旁白、節奏備註、發音指引與時間安排。",
    emptyProjectTitle: "請先建立或匯入 Flow 專案。",
    emptyProjectDescription: "旁白會依場景撰寫，並一併放入匯出資料包。",
    goImport: "前往多模態匯入",
    projectLabel: "Flow 專案",
    noBrand: "尚未指定品牌。",
    sceneList: "場景",
    emptySceneTitle: "請先建立 Flow 場景。",
    emptySceneDescription: "分鏡中的場景會出現在這裡，供你撰寫旁白。",
    goStoryboard: "前往 Flow 分鏡",
    voiceDraft: "旁白草稿",
    sceneNumber: (sceneNumber: number) => `場景 ${sceneNumber}`,
    duration: (durationSec: number) => `目標長度：${durationSec} 秒`,
    voiceOver: "旁白文案",
    pacingNotes: "節奏備註",
    pronunciationGuidance: "發音指引",
    timingNotes: "時間安排",
    save: "儲存旁白",
    copy: "複製旁白套件",
    needScene: "請先選擇場景。",
    saved: (sceneNumber: number) => `已儲存場景 ${sceneNumber} 的旁白。`,
    copied: "已複製旁白套件。",
    hasVoice: "已撰寫旁白",
    noVoice: "尚未撰寫旁白",
    flowPackage: "Flow 套件",
    written: "已撰寫",
    totalTime: "總時間",
    previewTitle: "旁白預覽",
    emptyValue: "尚未提供。",
  },
} as const;
