"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Package, Save, Trash2 } from "lucide-react";
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

type PropReference = {
  id: string;
  name: string;
  angles: string;
  materials: string;
  interiors: string;
  logos: string;
  forbiddenVariants: string;
};

const emptyForm = {
  name: "",
  angles: "",
  materials: "",
  interiors: "",
  logos: "",
  forbiddenVariants: "",
};

export default function PropsPage() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [projects, setProjects] = useState<FlowProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [props, setProps] = useState<PropReference[]>([]);
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
    async function loadProps() {
      if (!selectedProjectId) {
        setProps([]);
        return;
      }

      const bible = await db.projectBibles.where("projectId").equals(selectedProjectId).first();
      setProps(parseProps(bible?.vehicleBible));
    }

    void loadProps();
  }, [selectedProjectId]);

  const projectOptions = projects.map((project) => project.id);
  const projectNames = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project.name])),
    [projects],
  );

  const saveProps = async (nextProps: PropReference[]) => {
    if (!selectedProjectId) return;

    const existing = await db.projectBibles.where("projectId").equals(selectedProjectId).first();
    const now = new Date().toISOString();
    const vehicleBible = JSON.stringify(nextProps);

    if (existing) {
      await db.projectBibles.update(existing.id, { vehicleBible, updatedAt: now });
    } else {
      await db.projectBibles.add(createProjectBible(selectedProjectId, vehicleBible, now));
    }

    setProps(nextProps);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProjectId) {
      setMessage(labels.needProject);
      return;
    }

    const nextProp: PropReference = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      angles: form.angles.trim(),
      materials: form.materials.trim(),
      interiors: form.interiors.trim(),
      logos: form.logos.trim(),
      forbiddenVariants: form.forbiddenVariants.trim(),
    };

    const nextProps = [...props, nextProp];
    await saveProps(nextProps);
    setForm(emptyForm);
    setMessage(labels.saved(nextProp.name));
  };

  const deleteProp = async (propId: string) => {
    const nextProps = props.filter((prop) => prop.id !== propId);
    await saveProps(nextProps);
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
                <Package className="h-5 w-5 text-accent" aria-hidden="true" />
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
                  label={labels.angles}
                  value={form.angles}
                  onChange={(angles) => setForm({ ...form, angles })}
                />
                <FormTextarea
                  label={labels.materials}
                  value={form.materials}
                  onChange={(materials) => setForm({ ...form, materials })}
                />
                <FormTextarea
                  label={labels.interiors}
                  value={form.interiors}
                  onChange={(interiors) => setForm({ ...form, interiors })}
                />
                <FormTextarea
                  label={labels.logos}
                  value={form.logos}
                  onChange={(logos) => setForm({ ...form, logos })}
                />
                <FormTextarea
                  label={labels.forbiddenVariants}
                  value={form.forbiddenVariants}
                  onChange={(forbiddenVariants) => setForm({ ...form, forbiddenVariants })}
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
            {props.length === 0 ? (
              <AppCard>
                <h2 className="section-title">{labels.noPropsTitle}</h2>
                <p className="muted-text mt-3">{labels.noPropsDescription}</p>
              </AppCard>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {props.map((prop) => (
                  <AppCard key={prop.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="card-title truncate">{prop.name}</h2>
                        <p className="mt-1 text-sm text-muted">{labels.savedProp}</p>
                      </div>
                      <button
                        type="button"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-app border border-border text-danger transition hover:bg-dangerSoft"
                        onClick={() => deleteProp(prop.id)}
                        aria-label={labels.delete}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <Detail label={labels.angles} value={prop.angles} />
                    <Detail label={labels.materials} value={prop.materials} />
                    <Detail label={labels.interiors} value={prop.interiors} />
                    <Detail label={labels.logos} value={prop.logos} />
                    <Detail label={labels.forbiddenVariants} value={prop.forbiddenVariants} />
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

function parseProps(value?: string) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as PropReference[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createProjectBible(projectId: string, vehicleBible: string, now: string): ProjectBible {
  return {
    id: crypto.randomUUID(),
    projectId,
    brandBible: "",
    characterBible: "",
    vehicleBible,
    environmentBible: "",
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
    title: "Props",
    description: "Document angles, materials, interiors, logos, and forbidden variations.",
    emptyTitle: "Create or import a Flow Project first.",
    emptyDescription: "Prop references are saved per project and included in the project bible.",
    goImport: "Go to Multimodal Import",
    projectLabel: "Flow Project",
    noProject: "No project selected.",
    formTitle: "New Prop Reference",
    name: "Prop Name",
    angles: "Angles",
    materials: "Materials",
    interiors: "Interior Details",
    logos: "Logos",
    forbiddenVariants: "Forbidden Variants",
    save: "Save Prop",
    needProject: "Select a Flow Project first.",
    saved: (name: string) => `Saved ${name}.`,
    deleted: "Prop reference deleted.",
    noPropsTitle: "No prop references yet.",
    noPropsDescription: "Add prop rules so Google Flow prompts can preserve visual continuity.",
    savedProp: "Saved prop reference",
    delete: "Delete prop",
  },
  "zh-TW": {
    title: "道具",
    description: "記錄角度、材質、內裝、徽標，以及不可出現的變體。",
    emptyTitle: "請先建立或匯入 Flow 專案。",
    emptyDescription: "道具參考會依專案儲存，並一併放入專案聖經。",
    goImport: "前往多模態匯入",
    projectLabel: "Flow 專案",
    noProject: "尚未選擇專案。",
    formTitle: "新增道具參考",
    name: "道具名稱",
    angles: "角度",
    materials: "材質",
    interiors: "內裝",
    logos: "徽標",
    forbiddenVariants: "不可出現的變體",
    save: "儲存道具",
    needProject: "請先選擇 Flow 專案。",
    saved: (name: string) => `已儲存 ${name}。`,
    deleted: "已刪除道具參考。",
    noPropsTitle: "尚未建立道具參考。",
    noPropsDescription: "加入道具規則後，Google Flow 提示詞就能更穩定維持視覺連續性。",
    savedProp: "已儲存的道具參考",
    delete: "刪除道具",
  },
} as const;
