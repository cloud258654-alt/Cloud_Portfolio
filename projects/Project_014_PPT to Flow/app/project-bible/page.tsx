"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpen, Clipboard, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { db } from "@/lib/db";
import type { ProjectBible } from "@/lib/types/bible";
import type { FlowProject } from "@/lib/types/flow";
import { useLanguage } from "@/lib/i18n";

type BibleForm = {
  brandBible: string;
  cameraBible: string;
  lightingBible: string;
  colorBible: string;
  audioRules: string;
  motionBible: string;
  emotionBible: string;
  negativePromptBible: string;
};

type AudioBibleData = {
  audioRules: string;
  voiceNotes: unknown[];
};

type ProjectBibleRulesInput = Pick<
  ProjectBible,
  | "brandBible"
  | "cameraBible"
  | "lightingBible"
  | "colorBible"
  | "audioBible"
  | "motionBible"
  | "emotionBible"
  | "negativePromptBible"
  | "updatedAt"
>;

const emptyForm: BibleForm = {
  brandBible: "",
  cameraBible: "",
  lightingBible: "",
  colorBible: "",
  audioRules: "",
  motionBible: "",
  emotionBible: "",
  negativePromptBible: "",
};

export default function ProjectBiblePage() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [projects, setProjects] = useState<FlowProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [bible, setBible] = useState<ProjectBible | null>(null);
  const [form, setForm] = useState<BibleForm>(emptyForm);
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
    async function loadBible() {
      if (!selectedProjectId) {
        setBible(null);
        setForm(emptyForm);
        return;
      }

      const loadedBible = await db.projectBibles.where("projectId").equals(selectedProjectId).first();
      setBible(loadedBible ?? null);
      setForm(bibleToForm(loadedBible));
      setMessage(null);
    }

    void loadBible();
  }, [selectedProjectId]);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const projectOptions = projects.map((project) => ({ value: project.id, label: project.name }));
  const preview = useMemo(() => formatBiblePreview(selectedProject, form, labels), [selectedProject, form, labels]);

  const saveBible = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProjectId) {
      setMessage(labels.needProject);
      return;
    }

    const now = new Date().toISOString();
    const audioBible = mergeAudioBible(bible?.audioBible, form.audioRules);
    const input = {
      brandBible: form.brandBible.trim(),
      cameraBible: form.cameraBible.trim(),
      lightingBible: form.lightingBible.trim(),
      colorBible: form.colorBible.trim(),
      audioBible,
      motionBible: form.motionBible.trim(),
      emotionBible: form.emotionBible.trim(),
      negativePromptBible: form.negativePromptBible.trim(),
      updatedAt: now,
    };

    if (bible) {
      await db.projectBibles.update(bible.id, input);
      setBible({ ...bible, ...input });
    } else {
      const nextBible = createProjectBible(selectedProjectId, input, now);
      await db.projectBibles.add(nextBible);
      setBible(nextBible);
    }

    setMessage(labels.saved);
  };

  const copyPreview = async () => {
    await navigator.clipboard.writeText(preview);
    setMessage(labels.copied);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={labels.title} description={labels.description} />

      <AppCard>
        <div className="flex items-start gap-3">
          <BookOpen className="mt-1 h-5 w-5 text-accent" aria-hidden="true" />
          <div>
            <h2 className="card-title">{labels.howToUseTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{labels.howToUseDescription}</p>
          </div>
        </div>
      </AppCard>

      {projects.length === 0 ? (
        <AppCard>
          <h2 className="section-title">{labels.emptyTitle}</h2>
          <p className="muted-text mt-3">{labels.emptyDescription}</p>
          <AppButton href="/import" className="mt-6 w-fit">
            {labels.goImport}
          </AppButton>
        </AppCard>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section>
            <AppCard>
              <form className="space-y-5" onSubmit={saveBible}>
                <SelectField
                  label={labels.projectLabel}
                  value={selectedProjectId}
                  options={projectOptions}
                  onChange={setSelectedProjectId}
                />
                <FormTextarea
                  label={labels.brandBible}
                  value={form.brandBible}
                  onChange={(brandBible) => setForm({ ...form, brandBible })}
                />
                <FormTextarea
                  label={labels.cameraBible}
                  value={form.cameraBible}
                  onChange={(cameraBible) => setForm({ ...form, cameraBible })}
                />
                <FormTextarea
                  label={labels.lightingBible}
                  value={form.lightingBible}
                  onChange={(lightingBible) => setForm({ ...form, lightingBible })}
                />
                <FormTextarea
                  label={labels.colorBible}
                  value={form.colorBible}
                  onChange={(colorBible) => setForm({ ...form, colorBible })}
                />
                <FormTextarea
                  label={labels.audioRules}
                  value={form.audioRules}
                  onChange={(audioRules) => setForm({ ...form, audioRules })}
                />
                <FormTextarea
                  label={labels.motionBible}
                  value={form.motionBible}
                  onChange={(motionBible) => setForm({ ...form, motionBible })}
                />
                <FormTextarea
                  label={labels.emotionBible}
                  value={form.emotionBible}
                  onChange={(emotionBible) => setForm({ ...form, emotionBible })}
                />
                <FormTextarea
                  label={labels.negativePromptBible}
                  value={form.negativePromptBible}
                  onChange={(negativePromptBible) => setForm({ ...form, negativePromptBible })}
                />

                <div className="flex flex-wrap gap-3">
                  <AppButton type="submit">
                    <Save className="h-4 w-4" aria-hidden="true" />
                    {labels.save}
                  </AppButton>
                  <AppButton type="button" variant="outline" onClick={copyPreview}>
                    <Clipboard className="h-4 w-4" aria-hidden="true" />
                    {labels.copy}
                  </AppButton>
                </div>
                {message ? <p className="text-sm leading-6 text-muted">{message}</p> : null}
              </form>
            </AppCard>
          </section>

          <aside className="space-y-4">
            <AppCard>
              <h2 className="card-title">{labels.projectSummary}</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
                <p>{selectedProject?.name ?? labels.noProject}</p>
                <p>{selectedProject?.brandName || labels.noBrand}</p>
                <p>{labels.lastUpdated(bible?.updatedAt)}</p>
              </div>
            </AppCard>

            <AppCard>
              <h2 className="card-title">{labels.previewTitle}</h2>
              <pre className="mt-4 max-h-[42rem] overflow-y-auto whitespace-pre-wrap rounded-radius-sm border border-border bg-background p-3 text-sm leading-6 text-muted">
                {preview}
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

function bibleToForm(bible?: ProjectBible): BibleForm {
  if (!bible) return emptyForm;
  return {
    brandBible: bible.brandBible,
    cameraBible: bible.cameraBible,
    lightingBible: bible.lightingBible,
    colorBible: bible.colorBible,
    audioRules: parseAudioBible(bible.audioBible).audioRules,
    motionBible: bible.motionBible,
    emotionBible: bible.emotionBible,
    negativePromptBible: bible.negativePromptBible,
  };
}

function parseAudioBible(value?: string): AudioBibleData {
  if (!value) return { audioRules: "", voiceNotes: [] };
  try {
    const parsed = JSON.parse(value) as Partial<AudioBibleData> | unknown[];
    if (Array.isArray(parsed)) return { audioRules: "", voiceNotes: parsed };
    return {
      audioRules: typeof parsed.audioRules === "string" ? parsed.audioRules : "",
      voiceNotes: Array.isArray(parsed.voiceNotes) ? parsed.voiceNotes : [],
    };
  } catch {
    return { audioRules: value, voiceNotes: [] };
  }
}

function mergeAudioBible(currentValue: string | undefined, audioRules: string) {
  const current = parseAudioBible(currentValue);
  return JSON.stringify({ ...current, audioRules: audioRules.trim() });
}

function createProjectBible(
  projectId: string,
  input: ProjectBibleRulesInput,
  now: string,
): ProjectBible {
  return {
    id: crypto.randomUUID(),
    projectId,
    characterBible: "",
    vehicleBible: "",
    environmentBible: "",
    createdAt: now,
    ...input,
  };
}

function formatBiblePreview(
  project: FlowProject | null,
  form: BibleForm,
  labels: (typeof copy)["en"] | (typeof copy)["zh-TW"],
) {
  return [
    `# ${project?.name ?? labels.noProject} - ${labels.title}`,
    "",
    `## ${labels.brandBible}`,
    form.brandBible || labels.emptyValue,
    "",
    `## ${labels.cameraBible}`,
    form.cameraBible || labels.emptyValue,
    "",
    `## ${labels.lightingBible}`,
    form.lightingBible || labels.emptyValue,
    "",
    `## ${labels.colorBible}`,
    form.colorBible || labels.emptyValue,
    "",
    `## ${labels.audioRules}`,
    form.audioRules || labels.emptyValue,
    "",
    `## ${labels.motionBible}`,
    form.motionBible || labels.emptyValue,
    "",
    `## ${labels.emotionBible}`,
    form.emotionBible || labels.emptyValue,
    "",
    `## ${labels.negativePromptBible}`,
    form.negativePromptBible || labels.emptyValue,
  ].join("\n");
}

const copy = {
  en: {
    title: "Project Bible",
    description: "Centralize brand, camera, lighting, color, audio, motion, emotion, and negative prompt rules.",
    howToUseTitle: "How To Use The Project Bible",
    howToUseDescription:
      "Use this page as the project-wide rulebook. Prompts, QA, export handoffs, and human review can all refer back to these rules so every scene keeps the same brand, camera, lighting, tone, and negative constraints.",
    emptyTitle: "Create or import a Flow Project first.",
    emptyDescription: "The Project Bible is saved per project.",
    goImport: "Go to Multimodal Import",
    projectLabel: "Flow Project",
    noProject: "No project selected.",
    noBrand: "No brand specified.",
    projectSummary: "Project Summary",
    lastUpdated: (value?: string) => `Last updated: ${value ? new Date(value).toLocaleString() : "Not saved yet"}`,
    brandBible: "Brand Rules",
    cameraBible: "Camera Rules",
    lightingBible: "Lighting Rules",
    colorBible: "Color Rules",
    audioRules: "Audio Rules",
    motionBible: "Motion Rules",
    emotionBible: "Emotion Rules",
    negativePromptBible: "Negative Prompt Rules",
    save: "Save Project Bible",
    copy: "Copy Bible",
    needProject: "Select a Flow Project first.",
    saved: "Project Bible saved.",
    copied: "Project Bible copied.",
    previewTitle: "Bible Preview",
    emptyValue: "Not provided.",
  },
  "zh-TW": {
    title: "專案聖經",
    description: "集中管理品牌、鏡頭、燈光、色彩、音訊、動態、情緒與負面提示規則。",
    howToUseTitle: "專案聖經怎麼使用",
    howToUseDescription:
      "把這裡當成整支影片的共同規則書。之後寫提示詞、做品檢、匯出交付或人工檢查時，都回到這裡確認品牌、鏡頭、燈光、色彩、情緒與不可出現內容是否一致。",
    emptyTitle: "請先建立或匯入 Flow 專案。",
    emptyDescription: "專案聖經會依每個專案分開儲存。",
    goImport: "前往多模態匯入",
    projectLabel: "Flow 專案",
    noProject: "尚未選擇專案。",
    noBrand: "尚未指定品牌。",
    projectSummary: "專案摘要",
    lastUpdated: (value?: string) => `最後更新：${value ? new Date(value).toLocaleString() : "尚未儲存"}`,
    brandBible: "品牌規則",
    cameraBible: "鏡頭規則",
    lightingBible: "燈光規則",
    colorBible: "色彩規則",
    audioRules: "音訊規則",
    motionBible: "動態規則",
    emotionBible: "情緒規則",
    negativePromptBible: "負面提示規則",
    save: "儲存專案聖經",
    copy: "複製聖經",
    needProject: "請先選擇 Flow 專案。",
    saved: "已儲存專案聖經。",
    copied: "已複製專案聖經。",
    previewTitle: "聖經預覽",
    emptyValue: "尚未提供。",
  },
} as const;
