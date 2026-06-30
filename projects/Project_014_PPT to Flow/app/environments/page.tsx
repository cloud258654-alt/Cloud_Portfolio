"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Map, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { db } from "@/lib/db";
import type { ProjectBible } from "@/lib/types/bible";
import type { FlowProject } from "@/lib/types/flow";
import { useLanguage } from "@/lib/i18n";

type EnvironmentReference = {
  id: string;
  name: string;
  location: string;
  weather: string;
  surfaces: string;
  props: string;
  lighting: string;
  continuity: string;
};

const emptyForm = {
  name: "",
  location: "",
  weather: "",
  surfaces: "",
  props: "",
  lighting: "",
  continuity: "",
};

export default function EnvironmentsPage() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [projects, setProjects] = useState<FlowProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [environments, setEnvironments] = useState<EnvironmentReference[]>([]);
  const [form, setForm] = useState(emptyForm);
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
    async function loadEnvironments() {
      if (!selectedProjectId) {
        setEnvironments([]);
        return;
      }

      const bible = await db.projectBibles.where("projectId").equals(selectedProjectId).first();
      setEnvironments(parseEnvironments(bible?.environmentBible));
    }

    void loadEnvironments();
  }, [selectedProjectId]);

  const projectOptions = projects.map((project) => project.id);
  const projectNames = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project.name])),
    [projects],
  );

  const saveEnvironments = async (nextEnvironments: EnvironmentReference[]) => {
    if (!selectedProjectId) return;

    const existing = await db.projectBibles.where("projectId").equals(selectedProjectId).first();
    const now = new Date().toISOString();
    const environmentBible = JSON.stringify(nextEnvironments);

    if (existing) {
      await db.projectBibles.update(existing.id, { environmentBible, updatedAt: now });
    } else {
      await db.projectBibles.add(createProjectBible(selectedProjectId, environmentBible, now));
    }

    setEnvironments(nextEnvironments);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProjectId) {
      setMessage(labels.needProject);
      return;
    }

    const nextEnvironment: EnvironmentReference = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      location: form.location.trim(),
      weather: form.weather.trim(),
      surfaces: form.surfaces.trim(),
      props: form.props.trim(),
      lighting: form.lighting.trim(),
      continuity: form.continuity.trim(),
    };

    const nextEnvironments = [...environments, nextEnvironment];
    await saveEnvironments(nextEnvironments);
    setForm(emptyForm);
    setMessage(labels.saved(nextEnvironment.name));
  };

  const deleteEnvironment = async (environmentId: string) => {
    const nextEnvironments = environments.filter((environment) => environment.id !== environmentId);
    await saveEnvironments(nextEnvironments);
    setMessage(labels.deleted);
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
                onChange={setSelectedProjectId}
              />
              <p className="mt-3 text-sm leading-6 text-muted">
                {projectNames[selectedProjectId] ?? labels.noProject}
              </p>
            </AppCard>

            <AppCard>
              <div className="flex items-center gap-3">
                <Map className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="card-title">{labels.formTitle}</h2>
              </div>
              <form className="mt-5 space-y-4" onSubmit={onSubmit}>
                <FormInput
                  label={labels.name}
                  value={form.name}
                  onChange={(name) => setForm({ ...form, name })}
                  required
                />
                <FormTextarea
                  label={labels.location}
                  value={form.location}
                  onChange={(location) => setForm({ ...form, location })}
                />
                <FormTextarea
                  label={labels.weather}
                  value={form.weather}
                  onChange={(weather) => setForm({ ...form, weather })}
                />
                <FormTextarea
                  label={labels.surfaces}
                  value={form.surfaces}
                  onChange={(surfaces) => setForm({ ...form, surfaces })}
                />
                <FormTextarea
                  label={labels.props}
                  value={form.props}
                  onChange={(props) => setForm({ ...form, props })}
                />
                <FormTextarea
                  label={labels.lighting}
                  value={form.lighting}
                  onChange={(lighting) => setForm({ ...form, lighting })}
                />
                <FormTextarea
                  label={labels.continuity}
                  value={form.continuity}
                  onChange={(continuity) => setForm({ ...form, continuity })}
                />

                <AppButton type="submit" className="w-full">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {labels.save}
                </AppButton>
                {message ? <p className="text-sm leading-6 text-muted">{message}</p> : null}
              </form>
            </AppCard>
          </aside>

          <section className="space-y-4">
            {environments.length === 0 ? (
              <AppCard>
                <h2 className="section-title">{labels.noEnvironmentsTitle}</h2>
                <p className="muted-text mt-3">{labels.noEnvironmentsDescription}</p>
              </AppCard>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {environments.map((environment) => (
                  <AppCard key={environment.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="card-title truncate">{environment.name}</h2>
                        <p className="mt-1 text-sm text-muted">{labels.savedEnvironment}</p>
                      </div>
                      <button
                        type="button"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-app border border-border text-danger transition hover:bg-dangerSoft"
                        onClick={() => deleteEnvironment(environment.id)}
                        aria-label={labels.delete}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <Detail label={labels.location} value={environment.location} />
                    <Detail label={labels.weather} value={environment.weather} />
                    <Detail label={labels.surfaces} value={environment.surfaces} />
                    <Detail label={labels.props} value={environment.props} />
                    <Detail label={labels.lighting} value={environment.lighting} />
                    <Detail label={labels.continuity} value={environment.continuity} />
                  </AppCard>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="mt-4">
      <p className="caption-text font-semibold">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted">{value}</p>
    </div>
  );
}

function parseEnvironments(value?: string) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as EnvironmentReference[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createProjectBible(projectId: string, environmentBible: string, now: string): ProjectBible {
  return {
    id: crypto.randomUUID(),
    projectId,
    brandBible: "",
    characterBible: "",
    vehicleBible: "",
    environmentBible,
    cameraBible: "",
    lightingBible: "",
    colorBible: "",
    audioBible: "",
    motionBible: "",
    emotionBible: "",
    negativePromptBible: "",
    createdAt: now,
    updatedAt: now,
  };
}

const copy = {
  en: {
    title: "Environments",
    description: "Capture locations, weather, surfaces, props, lighting conditions, and scene continuity.",
    emptyTitle: "Create or import a Flow Project first.",
    emptyDescription: "Environment references are saved per project and included in the project bible.",
    goImport: "Go to Multimodal Import",
    projectLabel: "Flow Project",
    noProject: "No project selected.",
    formTitle: "New Environment Reference",
    name: "Environment Name",
    location: "Location",
    weather: "Weather",
    surfaces: "Surface Materials",
    props: "Props",
    lighting: "Lighting Conditions",
    continuity: "Scene Continuity",
    save: "Save Environment",
    needProject: "Select a Flow Project first.",
    saved: (name: string) => `Saved ${name}.`,
    deleted: "Environment reference deleted.",
    noEnvironmentsTitle: "No environment references yet.",
    noEnvironmentsDescription: "Add environment rules so Google Flow prompts can preserve location and lighting continuity.",
    savedEnvironment: "Saved environment reference",
    delete: "Delete environment",
  },
  "zh-TW": {
    title: "環境",
    description: "整理地點、天氣、表面材質、道具、光線條件與場景連續性。",
    emptyTitle: "請先建立或匯入 Flow 專案。",
    emptyDescription: "環境參考會依專案儲存，並一併放入專案聖經。",
    goImport: "前往多模態匯入",
    projectLabel: "Flow 專案",
    noProject: "尚未選擇專案。",
    formTitle: "新增環境參考",
    name: "環境名稱",
    location: "地點",
    weather: "天氣",
    surfaces: "表面材質",
    props: "道具",
    lighting: "光線條件",
    continuity: "場景連續性",
    save: "儲存環境",
    needProject: "請先選擇 Flow 專案。",
    saved: (name: string) => `已儲存 ${name}。`,
    deleted: "已刪除環境參考。",
    noEnvironmentsTitle: "尚未建立環境參考。",
    noEnvironmentsDescription: "加入環境規則後，Google Flow 提示詞就能更穩定維持地點與光線連續性。",
    savedEnvironment: "已儲存的環境參考",
    delete: "刪除環境",
  },
} as const;
