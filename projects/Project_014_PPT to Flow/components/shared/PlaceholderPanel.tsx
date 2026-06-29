"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { useLanguage, type TranslationKey } from "@/lib/i18n";

type PlaceholderPanelProps = {
  title: string;
  description: string;
  stages?: string[];
};

const placeholderKeys: Record<string, { title: TranslationKey; description: TranslationKey }> = {
  Characters: {
    title: "placeholder.characters.title",
    description: "placeholder.characters.description",
  },
  Vehicles: {
    title: "placeholder.vehicles.title",
    description: "placeholder.vehicles.description",
  },
  Environments: {
    title: "placeholder.environments.title",
    description: "placeholder.environments.description",
  },
  "Hero Images": {
    title: "placeholder.heroImages.title",
    description: "placeholder.heroImages.description",
  },
  "Ending Frames": {
    title: "placeholder.endingFrames.title",
    description: "placeholder.endingFrames.description",
  },
  "Project Bible": {
    title: "placeholder.projectBible.title",
    description: "placeholder.projectBible.description",
  },
  "Flow Prompts": {
    title: "placeholder.prompts.title",
    description: "placeholder.prompts.description",
  },
  "Flow QA": {
    title: "placeholder.qa.title",
    description: "placeholder.qa.description",
  },
  "Flow Export": {
    title: "placeholder.export.title",
    description: "placeholder.export.description",
  },
  "Flow Timeline": {
    title: "placeholder.timeline.title",
    description: "placeholder.timeline.description",
  },
  "Voice Over": {
    title: "placeholder.voice.title",
    description: "placeholder.voice.description",
  },
  Subtitles: {
    title: "placeholder.subtitles.title",
    description: "placeholder.subtitles.description",
  },
  Settings: {
    title: "placeholder.settings.title",
    description: "placeholder.settings.description",
  },
};

const zhStageLabels: Record<string, string> = {
  Inputs: "輸入資料",
  Builder: "編輯器",
  Output: "輸出結果",
  "Previous Flow Output": "前一段 Flow 輸出",
  "Ending Frame": "結尾畫面",
  "Next Flow Scene": "下一個 Flow 場景",
  "Prompt Draft": "提示詞草稿",
  "Flow Review": "Flow 檢視",
  "Flow Ready": "Flow 就緒",
  "Scene Reference": "場景參考",
  "Flow Ready Score": "Flow 準備分數",
  Continuity: "連續性",
  "Export Check": "匯出檢查",
  "Subtitle Lines": "字幕行",
  Timing: "時間設定",
  "SRT Export": "SRT 匯出",
  "Voice Draft": "旁白草稿",
  "Flow Package": "Flow 套件",
  "Flow Prompt": "Flow 提示詞",
  Assets: "素材",
  "Export Package": "匯出套件",
  "Hero Image": "主視覺圖片",
  "Google Flow": "Google Flow",
};

export function PlaceholderPanel({
  title,
  description,
  stages = ["Inputs", "Builder", "Output"],
}: PlaceholderPanelProps) {
  const { language, t } = useLanguage();
  const translation = placeholderKeys[title];
  const displayTitle = translation ? t(translation.title) : title;
  const displayDescription = translation ? t(translation.description) : description;

  return (
    <div className="space-y-6">
      <PageHeader title={displayTitle} description={displayDescription} />
      <section className="rounded-app border border-border bg-surface p-6 shadow-subtle">
        <div className="grid gap-4 md:grid-cols-3">
          {stages.map((label) => (
            <div key={label} className="rounded-app border border-border bg-background p-4">
              <p className="text-sm font-semibold">
                {language === "zh-TW" ? zhStageLabels[label] ?? label : label}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">{t("placeholder.note")}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}