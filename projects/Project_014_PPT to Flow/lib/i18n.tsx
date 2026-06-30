"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AppLanguage = "en" | "zh-TW";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
};

const storageKey = "flow-director-language";

export const translations = {
  en: {
    "topbar.search": "Search projects, scenes, prompts",
    "topbar.notifications": "Notifications",
    "topbar.languageToggle": "Switch language",
    "topbar.currentLanguage": "EN",
    "topbar.nextLanguage": "中文",
    "nav.primary": "Primary navigation",
    "nav.dashboard": "Dashboard",
    "nav.import": "Multimodal Import",
    "nav.projects": "Flow Projects",
    "nav.storyboard": "Flow Storyboard",
    "nav.projectBible": "Project Bible",
    "nav.characters": "Characters",
    "nav.vehicles": "Props",
    "nav.environments": "Environments",
    "nav.scenes": "Flow Scenes",
    "nav.heroImages": "Hero Images",
    "nav.endingFrames": "Ending Frames",
    "nav.prompts": "Flow Prompts",
    "nav.voice": "Voice Over",
    "nav.subtitles": "Subtitles",
    "nav.timeline": "Flow Timeline",
    "nav.qa": "Flow QA",
    "nav.export": "Flow Export",
    "nav.designSystem": "Design System",
    "nav.settings": "Settings",
    "placeholder.defaultStage.inputs": "Inputs",
    "placeholder.defaultStage.builder": "Builder",
    "placeholder.defaultStage.output": "Output",
    "placeholder.note": "Google Flow-focused workspace scaffolded for the next implementation pass.",
    "placeholder.characters.title": "Characters",
    "placeholder.characters.description": "Define recurring people, wardrobe, roles, expression ranges, and continuity anchors.",
    "placeholder.vehicles.title": "Props",
    "placeholder.vehicles.description": "Document prop angles, materials, interiors, logos, and forbidden variations.",
    "placeholder.environments.title": "Environments",
    "placeholder.environments.description": "Capture locations, weather, surfaces, props, lighting conditions, and scene continuity.",
    "placeholder.heroImages.title": "Hero Images",
    "placeholder.heroImages.description": "Prepare reference-ready hero images for each Flow Scene before prompting in Google Flow.",
    "placeholder.endingFrames.title": "Ending Frames",
    "placeholder.endingFrames.description": "Track ending frame availability so every Flow Scene can bridge cleanly into the next shot.",
    "placeholder.projectBible.title": "Project Bible",
    "placeholder.projectBible.description": "Centralize brand, camera, lighting, color, audio, motion, emotion, and negative prompt rules.",
    "placeholder.prompts.title": "Flow Prompts",
    "placeholder.prompts.description": "Prepare Google Flow prompts from the Project Bible, Hero Image notes, camera continuity, and Ending Frame needs.",
    "placeholder.qa.title": "Flow QA",
    "placeholder.qa.description": "Check Flow Ready Score, Hero Image quality, prompt completeness, consistency, and Ending Frame availability.",
    "placeholder.export.title": "Flow Export",
    "placeholder.export.description": "Export the Flow Export Package with Hero Image reference, Ending Frame reference, prompts, voice over, subtitles, and QA checklist.",
    "placeholder.timeline.title": "Flow Timeline",
    "placeholder.timeline.description": "Review the Google Flow timeline from Hero Image through Flow Output and Ending Frame.",
    "placeholder.voice.title": "Voice Over",
    "placeholder.voice.description": "Draft voice over copy, pacing notes, pronunciation guidance, and timing for each Flow Scene.",
    "placeholder.subtitles.title": "Subtitles",
    "placeholder.subtitles.description": "Prepare subtitle lines, reading speed, timestamps, and SRT content for the Flow Export Package.",
    "placeholder.settings.title": "Settings",
    "placeholder.settings.description": "Configure local storage preferences, export defaults, theme options, and workspace metadata.",
    "stage.visualBible": "Visual Bible",
    "stage.roles": "Roles",
    "stage.continuity": "Continuity",
    "stage.vehicleSpecs": "Vehicle Specs",
    "stage.shotRules": "Shot Rules",
    "stage.forbiddenDetails": "Forbidden Details",
    "stage.locationBible": "Location Bible",
    "stage.lighting": "Lighting",
    "stage.props": "Props",
    "stage.references": "References",
    "stage.shotBrief": "Shot Brief",
    "stage.approval": "Approval",
    "stage.availability": "Availability",
    "stage.transitions": "Transitions",
    "stage.nextScene": "Next Scene",
    "stage.rules": "Rules",
    "stage.negativePrompts": "Negative Prompts",
    "stage.handoff": "Handoff",
    "stage.promptBlocks": "Prompt Blocks",
    "stage.qa": "QA",
    "stage.export": "Export",
    "stage.readiness": "Readiness",
    "stage.consistency": "Consistency",
    "stage.fixList": "Fix List",
    "stage.assets": "Assets",
    "stage.markdown": "Markdown",
    "stage.checklist": "Checklist",
    "stage.timeline": "Timeline",
    "stage.sceneLinks": "Scene Links",
    "stage.flowHandoff": "Flow Handoff",
    "stage.script": "Script",
    "stage.pacing": "Pacing",
    "stage.audioNotes": "Audio Notes",
    "stage.subtitleLines": "Subtitle Lines",
    "stage.timing": "Timing",
    "stage.srtExport": "SRT Export",
    "stage.storage": "Storage",
    "stage.defaults": "Defaults",
    "stage.preferences": "Preferences",
  },
  "zh-TW": {
    "topbar.search": "搜尋專案、場景、提示詞",
    "topbar.notifications": "通知",
    "topbar.languageToggle": "切換語言",
    "topbar.currentLanguage": "中文",
    "topbar.nextLanguage": "EN",
    "nav.primary": "主要導覽",
    "nav.dashboard": "儀表板",
    "nav.import": "多模態匯入",
    "nav.projects": "Flow 專案",
    "nav.storyboard": "Flow 分鏡",
    "nav.projectBible": "專案聖經",
    "nav.characters": "角色",
    "nav.vehicles": "道具",
    "nav.environments": "環境",
    "nav.scenes": "Flow 場景",
    "nav.heroImages": "主視覺圖片",
    "nav.endingFrames": "結尾畫面",
    "nav.prompts": "Flow 提示詞",
    "nav.voice": "旁白",
    "nav.subtitles": "字幕",
    "nav.timeline": "Flow 時間線",
    "nav.qa": "Flow 品檢",
    "nav.export": "Flow 匯出",
    "nav.designSystem": "設計系統",
    "nav.settings": "設定",
    "placeholder.defaultStage.inputs": "輸入資料",
    "placeholder.defaultStage.builder": "編輯器",
    "placeholder.defaultStage.output": "輸出結果",
    "placeholder.note": "此區已建立 Google Flow 工作區骨架，將在下一輪實作補齊。",
    "placeholder.characters.title": "角色",
    "placeholder.characters.description": "定義常駐人物、服裝、角色定位、表情範圍與連續性錨點。",
    "placeholder.vehicles.title": "道具",
    "placeholder.vehicles.description": "記錄角度、材質、內裝、徽標，以及不可出現的變體。",
    "placeholder.environments.title": "環境",
    "placeholder.environments.description": "整理地點、天氣、表面材質、道具、光線條件與場景連續性。",
    "placeholder.heroImages.title": "主視覺圖片",
    "placeholder.heroImages.description": "在送入 Google Flow 前，為每個 Flow 場景準備可作為參考的主視覺圖片。",
    "placeholder.endingFrames.title": "結尾畫面",
    "placeholder.endingFrames.description": "追蹤結尾畫面是否可用，確保每個 Flow 場景能順暢銜接下一個鏡頭。",
    "placeholder.projectBible.title": "專案聖經",
    "placeholder.projectBible.description": "集中管理品牌、鏡頭、燈光、色彩、音訊、動態、情緒與負面提示規則。",
    "placeholder.prompts.title": "Flow 提示詞",
    "placeholder.prompts.description": "依據專案聖經、主視覺備註、鏡頭連續性與結尾畫面需求準備 Google Flow 提示詞。",
    "placeholder.qa.title": "Flow 品檢",
    "placeholder.qa.description": "檢查 Flow Ready Score、主視覺品質、提示詞完整度、一致性與結尾畫面可用性。",
    "placeholder.export.title": "Flow 匯出",
    "placeholder.export.description": "匯出包含主視覺參考、結尾畫面參考、提示詞、旁白、字幕與品檢清單的 Flow 套件。",
    "placeholder.timeline.title": "Flow 時間線",
    "placeholder.timeline.description": "檢視從主視覺、Flow 輸出到結尾畫面的 Google Flow 時間線。",
    "placeholder.voice.title": "旁白",
    "placeholder.voice.description": "為每個 Flow 場景撰寫旁白、節奏備註、發音指引與時間安排。",
    "placeholder.subtitles.title": "字幕",
    "placeholder.subtitles.description": "準備字幕行、閱讀速度、時間戳與 Flow 匯出套件所需的 SRT 內容。",
    "placeholder.settings.title": "設定",
    "placeholder.settings.description": "設定本機儲存偏好、匯出預設值、主題選項與工作區中繼資料。",
    "stage.visualBible": "視覺聖經",
    "stage.roles": "角色設定",
    "stage.continuity": "連續性",
    "stage.vehicleSpecs": "車輛規格",
    "stage.shotRules": "鏡頭規則",
    "stage.forbiddenDetails": "禁用細節",
    "stage.locationBible": "場景聖經",
    "stage.lighting": "燈光",
    "stage.props": "道具",
    "stage.references": "參考素材",
    "stage.shotBrief": "鏡頭簡報",
    "stage.approval": "核准狀態",
    "stage.availability": "可用性",
    "stage.transitions": "轉場",
    "stage.nextScene": "下一場景",
    "stage.rules": "規則",
    "stage.negativePrompts": "負面提示",
    "stage.handoff": "交付",
    "stage.promptBlocks": "提示詞區塊",
    "stage.qa": "品檢",
    "stage.export": "匯出",
    "stage.readiness": "準備度",
    "stage.consistency": "一致性",
    "stage.fixList": "修正清單",
    "stage.assets": "素材",
    "stage.markdown": "Markdown",
    "stage.checklist": "檢查清單",
    "stage.timeline": "時間線",
    "stage.sceneLinks": "場景連結",
    "stage.flowHandoff": "Flow 交付",
    "stage.script": "腳本",
    "stage.pacing": "節奏",
    "stage.audioNotes": "音訊備註",
    "stage.subtitleLines": "字幕行",
    "stage.timing": "時間設定",
    "stage.srtExport": "SRT 匯出",
    "stage.storage": "儲存",
    "stage.defaults": "預設值",
    "stage.preferences": "偏好設定",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("en");

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(storageKey);
    if (storedLanguage === "en" || storedLanguage === "zh-TW") {
      setLanguageState(storedLanguage);
    }
  }, []);

  const setLanguage = (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(storageKey, nextLanguage);
    document.documentElement.lang = nextLanguage;
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === "en" ? "zh-TW" : "en"),
      t: (key) => translations[language][key] ?? translations.en[key],
    }),
    [language],
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
