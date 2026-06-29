"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ImagePlus, Save, Trash2, Users } from "lucide-react";
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

type CharacterReference = {
  id: string;
  name: string;
  role: string;
  visualRules: string;
  continuityNotes: string;
  imageName?: string;
  imageDataUrl?: string;
};

const emptyForm = {
  name: "",
  role: "",
  visualRules: "",
  continuityNotes: "",
  imageName: "",
  imageDataUrl: "",
};

export default function CharactersPage() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [projects, setProjects] = useState<FlowProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [characters, setCharacters] = useState<CharacterReference[]>([]);
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
    async function loadCharacters() {
      if (!selectedProjectId) {
        setCharacters([]);
        return;
      }
      const bible = await db.projectBibles.where("projectId").equals(selectedProjectId).first();
      setCharacters(parseCharacters(bible?.characterBible));
    }

    void loadCharacters();
  }, [selectedProjectId]);

  const projectOptions = projects.map((project) => project.id);
  const projectNames = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project.name])),
    [projects],
  );

  const onImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const imageDataUrl = await readFileAsDataUrl(file);
    setForm((current) => ({ ...current, imageName: file.name, imageDataUrl }));
  };

  const saveCharacters = async (nextCharacters: CharacterReference[]) => {
    if (!selectedProjectId) return;
    const existing = await db.projectBibles.where("projectId").equals(selectedProjectId).first();
    const now = new Date().toISOString();
    const characterBible = JSON.stringify(nextCharacters);

    if (existing) {
      await db.projectBibles.update(existing.id, { characterBible, updatedAt: now });
    } else {
      await db.projectBibles.add(createProjectBible(selectedProjectId, characterBible, now));
    }

    setCharacters(nextCharacters);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProjectId) {
      setMessage(labels.needProject);
      return;
    }

    const nextCharacter: CharacterReference = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      role: form.role.trim(),
      visualRules: form.visualRules.trim(),
      continuityNotes: form.continuityNotes.trim(),
      imageName: form.imageName || undefined,
      imageDataUrl: form.imageDataUrl || undefined,
    };

    const nextCharacters = [...characters, nextCharacter];
    await saveCharacters(nextCharacters);
    setForm(emptyForm);
    setMessage(labels.saved(nextCharacter.name));
  };

  const deleteCharacter = async (characterId: string) => {
    const nextCharacters = characters.filter((character) => character.id !== characterId);
    await saveCharacters(nextCharacters);
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
                <Users className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="card-title">{labels.formTitle}</h2>
              </div>
              <form className="mt-5 space-y-4" onSubmit={onSubmit}>
                <FormInput label={labels.name} value={form.name} onChange={(name) => setForm({ ...form, name })} required />
                <FormInput label={labels.role} value={form.role} onChange={(role) => setForm({ ...form, role })} />
                <FormTextarea label={labels.visualRules} value={form.visualRules} onChange={(visualRules) => setForm({ ...form, visualRules })} />
                <FormTextarea label={labels.continuityNotes} value={form.continuityNotes} onChange={(continuityNotes) => setForm({ ...form, continuityNotes })} />

                <label className="block rounded-app border border-dashed border-border bg-background p-4 text-center transition hover:border-accent hover:bg-surfaceMuted">
                  <ImagePlus className="mx-auto h-6 w-6 text-accent" aria-hidden="true" />
                  <span className="mt-2 block text-sm font-semibold text-text">{labels.imageUpload}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted">{labels.imageHelp}</span>
                  <input className="sr-only" type="file" accept="image/*" onChange={onImageChange} />
                </label>

                {form.imageDataUrl ? (
                  <div className="overflow-hidden rounded-app border border-border bg-background">
                    <Image src={form.imageDataUrl} alt={form.imageName || labels.imagePreview} width={480} height={240} unoptimized className="h-48 w-full object-cover" />
                    <p className="truncate px-3 py-2 text-xs text-muted">{form.imageName}</p>
                  </div>
                ) : null}

                <AppButton type="submit" className="w-full">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {labels.save}
                </AppButton>
                {message ? <p className="text-sm leading-6 text-muted">{message}</p> : null}
              </form>
            </AppCard>
          </aside>

          <section className="space-y-4">
            {characters.length === 0 ? (
              <AppCard>
                <h2 className="section-title">{labels.noCharactersTitle}</h2>
                <p className="muted-text mt-3">{labels.noCharactersDescription}</p>
              </AppCard>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {characters.map((character) => (
                  <AppCard key={character.id} className="overflow-hidden p-0">
                    {character.imageDataUrl ? (
                      <Image src={character.imageDataUrl} alt={character.name} width={640} height={320} unoptimized className="h-56 w-full object-cover" />
                    ) : (
                      <div className="flex h-56 items-center justify-center bg-surfaceMuted text-muted">
                        <Users className="h-8 w-8" aria-hidden="true" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="card-title truncate">{character.name}</h2>
                          <p className="mt-1 text-sm text-muted">{character.role || labels.roleFallback}</p>
                        </div>
                        <button
                          type="button"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-app border border-border text-danger transition hover:bg-dangerSoft"
                          onClick={() => deleteCharacter(character.id)}
                          aria-label={labels.delete}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <Detail label={labels.visualRules} value={character.visualRules} />
                      <Detail label={labels.continuityNotes} value={character.continuityNotes} />
                      {character.imageName ? <p className="mt-4 truncate text-xs text-muted">{character.imageName}</p> : null}
                    </div>
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
      <p className="mt-1 text-sm leading-6 text-muted">{value}</p>
    </div>
  );
}

function parseCharacters(value?: string) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as CharacterReference[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function createProjectBible(projectId: string, characterBible: string, now: string): ProjectBible {
  return {
    id: crypto.randomUUID(),
    projectId,
    brandBible: "",
    characterBible,
    vehicleBible: "",
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
    title: "Characters",
    description: "Define recurring people, wardrobe, roles, expression ranges, continuity anchors, and image references for Google Flow.",
    emptyTitle: "Create or import a Flow Project first.",
    emptyDescription: "Character references are saved per project and included in the export package.",
    goImport: "Go to Multimodal Import",
    projectLabel: "Flow Project",
    noProject: "No project selected.",
    formTitle: "New Character Reference",
    name: "Character Name",
    role: "Role",
    visualRules: "Visual Rules",
    continuityNotes: "Continuity Notes",
    imageUpload: "Import Character Image",
    imageHelp: "Use a clear face/body/costume reference. Stored locally in this browser.",
    imagePreview: "Character image preview",
    save: "Save Character",
    needProject: "Select a Flow Project first.",
    saved: (name: string) => `Saved ${name}.`,
    deleted: "Character reference deleted.",
    noCharactersTitle: "No character references yet.",
    noCharactersDescription: "Add character images and rules so Google Flow prompts can preserve identity and continuity.",
    roleFallback: "Role not specified",
    delete: "Delete character",
  },
  "zh-TW": {
    title: "角色",
    description: "為 Google Flow 定義常駐人物、服裝、角色定位、表情範圍、連續性錨點與圖片參考。",
    emptyTitle: "請先建立或匯入 Flow 專案。",
    emptyDescription: "角色參考會依專案儲存，並一併放入匯出資料包。",
    goImport: "前往多模態匯入",
    projectLabel: "Flow 專案",
    noProject: "尚未選擇專案。",
    formTitle: "新增角色參考",
    name: "角色名稱",
    role: "角色定位",
    visualRules: "視覺規則",
    continuityNotes: "連續性備註",
    imageUpload: "匯入角色圖片",
    imageHelp: "建議使用清楚的臉部、全身或服裝參考圖；資料會儲存在本機瀏覽器。",
    imagePreview: "角色圖片預覽",
    save: "儲存角色",
    needProject: "請先選擇 Flow 專案。",
    saved: (name: string) => `已儲存 ${name}。`,
    deleted: "已刪除角色參考。",
    noCharactersTitle: "尚未建立角色參考。",
    noCharactersDescription: "加入角色圖片與規則後，Google Flow 提示詞就能更穩定維持身份與連續性。",
    roleFallback: "尚未指定角色定位",
    delete: "刪除角色",
  },
} as const;