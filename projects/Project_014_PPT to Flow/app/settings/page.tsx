"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Database, Save, Settings } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { FormInput } from "@/components/ui/FormInput";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { db } from "@/lib/db";
import { useLanguage, type AppLanguage } from "@/lib/i18n";
import type { Workspace } from "@/lib/types/workspace";

type ExportScope = "project" | "scene";
type ExportFormat = "markdown" | "json";
type ThemePreference = "system" | "light";

type AppSettings = {
  defaultExportFormat: ExportFormat;
  defaultExportScope: ExportScope;
  defaultTargetDurationSec: string;
  defaultSceneCount: string;
  themePreference: ThemePreference;
};

type WorkspaceForm = {
  name: string;
  description: string;
  ownerName: string;
  defaultLanguage: Workspace["defaultLanguage"];
};

const settingsKey = "flow-director-settings";

const defaultSettings: AppSettings = {
  defaultExportFormat: "markdown",
  defaultExportScope: "project",
  defaultTargetDurationSec: "30",
  defaultSceneCount: "3",
  themePreference: "system",
};

const emptyWorkspaceForm: WorkspaceForm = {
  name: "",
  description: "",
  ownerName: "",
  defaultLanguage: "zh-TW",
};

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const labels = copy[language];
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [workspaceForm, setWorkspaceForm] = useState<WorkspaceForm>(emptyWorkspaceForm);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedSettings = window.localStorage.getItem(settingsKey);
    if (storedSettings) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
      } catch {
        setSettings(defaultSettings);
      }
    }

    async function loadWorkspaces() {
      const loadedWorkspaces = await db.workspaces.orderBy("updatedAt").reverse().toArray();
      setWorkspaces(loadedWorkspaces);
      setSelectedWorkspaceId((current) => current || loadedWorkspaces.at(0)?.id || "");
    }

    void loadWorkspaces();
  }, []);

  const selectedWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? null,
    [selectedWorkspaceId, workspaces],
  );

  useEffect(() => {
    if (!selectedWorkspace) {
      setWorkspaceForm(emptyWorkspaceForm);
      return;
    }

    setWorkspaceForm({
      name: selectedWorkspace.name,
      description: selectedWorkspace.description,
      ownerName: selectedWorkspace.ownerName ?? "",
      defaultLanguage: selectedWorkspace.defaultLanguage,
    });
  }, [selectedWorkspace]);

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.localStorage.setItem(settingsKey, JSON.stringify(settings));
    setMessage(labels.settingsSaved);
  };

  const saveWorkspace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedWorkspace) {
      setMessage(labels.needWorkspace);
      return;
    }

    const updatedAt = new Date().toISOString();
    const input = {
      name: workspaceForm.name.trim(),
      description: workspaceForm.description.trim(),
      ownerName: workspaceForm.ownerName.trim() || undefined,
      defaultLanguage: workspaceForm.defaultLanguage,
      updatedAt,
    };

    await db.workspaces.update(selectedWorkspace.id, input);
    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id === selectedWorkspace.id ? { ...workspace, ...input } : workspace,
      ),
    );
    setMessage(labels.workspaceSaved);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={labels.title} description={labels.description} />

      <AppCard>
        <div className="flex items-start gap-3">
          <Settings className="mt-1 h-5 w-5 text-accent" aria-hidden="true" />
          <div>
            <h2 className="card-title">{labels.whatCanSet}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{labels.whatCanSetDescription}</p>
          </div>
        </div>
      </AppCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="space-y-6">
          <AppCard>
            <h2 className="section-title">{labels.appPreferences}</h2>
            <form className="mt-5 space-y-5" onSubmit={saveSettings}>
              <SelectField
                label={labels.language}
                value={language}
                options={[
                  { value: "zh-TW", label: "中文" },
                  { value: "en", label: "English" },
                ]}
                onChange={(value) => setLanguage(value as AppLanguage)}
              />
              <SelectField
                label={labels.defaultExportFormat}
                value={settings.defaultExportFormat}
                options={[
                  { value: "markdown", label: "Markdown" },
                  { value: "json", label: "JSON" },
                ]}
                onChange={(value) =>
                  setSettings({ ...settings, defaultExportFormat: value as ExportFormat })
                }
              />
              <SelectField
                label={labels.defaultExportScope}
                value={settings.defaultExportScope}
                options={[
                  { value: "project", label: labels.fullProject },
                  { value: "scene", label: labels.singleScene },
                ]}
                onChange={(value) =>
                  setSettings({ ...settings, defaultExportScope: value as ExportScope })
                }
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput
                  label={labels.defaultTargetDuration}
                  value={settings.defaultTargetDurationSec}
                  type="number"
                  onChange={(defaultTargetDurationSec) =>
                    setSettings({ ...settings, defaultTargetDurationSec })
                  }
                />
                <FormInput
                  label={labels.defaultSceneCount}
                  value={settings.defaultSceneCount}
                  type="number"
                  onChange={(defaultSceneCount) => setSettings({ ...settings, defaultSceneCount })}
                />
              </div>
              <SelectField
                label={labels.themePreference}
                value={settings.themePreference}
                options={[
                  { value: "system", label: labels.themeSystem },
                  { value: "light", label: labels.themeLight },
                ]}
                onChange={(value) =>
                  setSettings({ ...settings, themePreference: value as ThemePreference })
                }
              />
              <AppButton type="submit">
                <Save className="h-4 w-4" aria-hidden="true" />
                {labels.saveSettings}
              </AppButton>
            </form>
          </AppCard>

          <AppCard>
            <h2 className="section-title">{labels.workspaceMetadata}</h2>
            {workspaces.length === 0 ? (
              <div className="mt-5">
                <p className="text-sm leading-6 text-muted">{labels.noWorkspace}</p>
                <AppButton href="/import" className="mt-5 w-fit">
                  {labels.goImport}
                </AppButton>
              </div>
            ) : (
              <form className="mt-5 space-y-5" onSubmit={saveWorkspace}>
                <SelectField
                  label={labels.workspace}
                  value={selectedWorkspaceId}
                  options={workspaces.map((workspace) => ({
                    value: workspace.id,
                    label: workspace.name,
                  }))}
                  onChange={setSelectedWorkspaceId}
                />
                <FormInput
                  label={labels.workspaceName}
                  value={workspaceForm.name}
                  onChange={(name) => setWorkspaceForm({ ...workspaceForm, name })}
                  required
                />
                <FormTextarea
                  label={labels.workspaceDescription}
                  value={workspaceForm.description}
                  onChange={(description) =>
                    setWorkspaceForm({ ...workspaceForm, description })
                  }
                />
                <FormInput
                  label={labels.ownerName}
                  value={workspaceForm.ownerName}
                  onChange={(ownerName) => setWorkspaceForm({ ...workspaceForm, ownerName })}
                />
                <SelectField
                  label={labels.workspaceLanguage}
                  value={workspaceForm.defaultLanguage}
                  options={[
                    { value: "zh-TW", label: "zh-TW" },
                    { value: "en", label: "en" },
                    { value: "ja", label: "ja" },
                  ]}
                  onChange={(defaultLanguage) =>
                    setWorkspaceForm({
                      ...workspaceForm,
                      defaultLanguage: defaultLanguage as Workspace["defaultLanguage"],
                    })
                  }
                />
                <AppButton type="submit">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {labels.saveWorkspace}
                </AppButton>
              </form>
            )}
          </AppCard>
        </section>

        <aside className="space-y-4">
          <AppCard>
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="card-title">{labels.localStorage}</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
              <p>{labels.localStorageDescription}</p>
              <p>{labels.workspaceCount(workspaces.length)}</p>
              <p>{labels.settingsStorage}</p>
            </div>
          </AppCard>

          <AppCard>
            <h2 className="card-title">{labels.currentSettings}</h2>
            <dl className="mt-4 space-y-3 text-sm leading-6 text-muted">
              <SettingRow label={labels.language} value={language} />
              <SettingRow label={labels.defaultExportFormat} value={settings.defaultExportFormat} />
              <SettingRow label={labels.defaultExportScope} value={settings.defaultExportScope} />
              <SettingRow label={labels.defaultTargetDuration} value={`${settings.defaultTargetDurationSec}s`} />
              <SettingRow label={labels.defaultSceneCount} value={settings.defaultSceneCount} />
              <SettingRow label={labels.themePreference} value={settings.themePreference} />
            </dl>
            {message ? <p className="mt-4 text-sm leading-6 text-muted">{message}</p> : null}
          </AppCard>
        </aside>
      </div>
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

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-b-0 last:pb-0">
      <dt>{label}</dt>
      <dd className="font-semibold text-text">{value}</dd>
    </div>
  );
}

const copy = {
  en: {
    title: "Settings",
    description: "Configure local storage preferences, export defaults, theme options, and workspace metadata.",
    whatCanSet: "What Settings Control",
    whatCanSetDescription:
      "Use Settings for app-wide preferences and workspace metadata. Scene content, prompts, subtitles, QA, and exports stay in their dedicated production pages.",
    appPreferences: "App Preferences",
    language: "Interface Language",
    defaultExportFormat: "Default Export Format",
    defaultExportScope: "Default Export Scope",
    fullProject: "Full Project",
    singleScene: "Single Scene",
    defaultTargetDuration: "Default Target Duration",
    defaultSceneCount: "Default Scene Count",
    themePreference: "Theme Preference",
    themeSystem: "System",
    themeLight: "Light",
    saveSettings: "Save Settings",
    workspaceMetadata: "Workspace Metadata",
    workspace: "Workspace",
    workspaceName: "Workspace Name",
    workspaceDescription: "Workspace Description",
    ownerName: "Owner Name",
    workspaceLanguage: "Workspace Default Language",
    saveWorkspace: "Save Workspace",
    noWorkspace: "No workspace has been created yet.",
    goImport: "Go to Multimodal Import",
    localStorage: "Local Data",
    localStorageDescription: "This app stores workspace, project, scene, and production data in this browser through IndexedDB.",
    workspaceCount: (count: number) => `${count} workspace${count === 1 ? "" : "s"} stored locally.`,
    settingsStorage: "Preference settings are stored in localStorage.",
    currentSettings: "Current Settings",
    settingsSaved: "Settings saved.",
    workspaceSaved: "Workspace metadata saved.",
    needWorkspace: "Select a workspace first.",
  },
  "zh-TW": {
    title: "設定",
    description: "設定本機儲存偏好、匯出預設值、主題選項與工作區中繼資料。",
    whatCanSet: "設定功能可以設定什麼",
    whatCanSetDescription:
      "設定頁用來管理整個 App 的偏好與工作區資料。場景內容、提示詞、字幕、品檢與匯出，仍然到各自的製作頁處理。",
    appPreferences: "App 偏好",
    language: "介面語言",
    defaultExportFormat: "預設匯出格式",
    defaultExportScope: "預設匯出範圍",
    fullProject: "全片總表",
    singleScene: "單一 Scene",
    defaultTargetDuration: "預設目標片長",
    defaultSceneCount: "預設場景數",
    themePreference: "主題偏好",
    themeSystem: "跟隨系統",
    themeLight: "淺色",
    saveSettings: "儲存設定",
    workspaceMetadata: "工作區中繼資料",
    workspace: "工作區",
    workspaceName: "工作區名稱",
    workspaceDescription: "工作區描述",
    ownerName: "擁有者名稱",
    workspaceLanguage: "工作區預設語言",
    saveWorkspace: "儲存工作區",
    noWorkspace: "尚未建立工作區。",
    goImport: "前往多模態匯入",
    localStorage: "本機資料",
    localStorageDescription: "此 App 會用 IndexedDB 將工作區、專案、場景與製作資料儲存在目前瀏覽器。",
    workspaceCount: (count: number) => `目前本機儲存 ${count} 個工作區。`,
    settingsStorage: "偏好設定會儲存在 localStorage。",
    currentSettings: "目前設定",
    settingsSaved: "已儲存設定。",
    workspaceSaved: "已儲存工作區中繼資料。",
    needWorkspace: "請先選擇工作區。",
  },
} as const;
