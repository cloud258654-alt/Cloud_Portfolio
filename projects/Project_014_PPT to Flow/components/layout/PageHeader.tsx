"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

const zhText: Record<string, string> = {
  "Google Flow production command center": "Google Flow 製作中控台",
  "A production operating system for planning, prompting, and managing Google Flow videos.":
    "用於規劃、撰寫提示詞與管理 Google Flow 影片製作的本機製作系統。",
  "Flow Projects": "Flow 專案",
  "Manage Google Flow video production projects.": "管理 Google Flow 影片製作專案。",
  "Flow Storyboard Studio": "Flow 分鏡工作室",
  "A Google Flow long-form production studio for cinematic scene planning.":
    "用於規劃電影感場景的 Google Flow 長影片製作工作室。",
  "A production studio for building a complete Google Flow long video scene by scene.":
    "逐場建立完整 Google Flow 長影片的製作工作室。",
  "Flow Scenes": "Flow 場景",
  "Manage scene workspace cards for Google Flow production.":
    "管理 Google Flow 製作所需的場景工作卡。",
  "Build Flow Scene cards with Scene Health Score, Hero Image status, Flow Prompt status, and Ending Frame status.":
    "建立包含場景健康分數、主視覺狀態、Flow 提示詞狀態與結尾畫面狀態的 Flow 場景卡。",
  "Create your first Google Flow Project": "建立第一個 Google Flow 專案",
  "Create a Flow Project first.": "請先建立 Flow 專案。",
  "Design System": "設計系統",
  "A reusable visual language for premium, calm, Google Flow-focused production tools.":
    "為高質感、沉穩且聚焦 Google Flow 的製作工具建立可重用的視覺語言。",
};

function localize(language: string, value?: string) {
  if (!value || language !== "zh-TW") return value;
  return zhText[value] ?? value;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
}: PageHeaderProps) {
  const { language } = useLanguage();
  const displayEyebrow = localize(language, eyebrow);
  const displayTitle = localize(language, title) ?? title;
  const displayDescription = localize(language, description);
  const displayActionLabel = localize(language, actionLabel);

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {displayEyebrow ? <p className="text-sm font-semibold text-accent">{displayEyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-text sm:text-4xl">{displayTitle}</h1>
        {displayDescription ? <p className="mt-3 text-base leading-7 text-muted">{displayDescription}</p> : null}
      </div>
      {displayActionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-app bg-accent px-4 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {displayActionLabel}
        </Link>
      ) : null}
    </header>
  );
}