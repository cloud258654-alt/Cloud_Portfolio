"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, CheckCircle2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppProgress } from "@/components/ui/AppProgress";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { db } from "@/lib/db";
import { calculateSceneHealthScore } from "@/lib/engines/sceneHealthEngine";
import type { FlowProject, FlowScene } from "@/lib/types/flow";
import { average } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

type QACheck = {
  key: string;
  label: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  fix: string;
};

type QAResult = {
  score: number;
  checks: QACheck[];
  missing: QACheck[];
  ready: boolean;
};

export default function QAPage() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [projects, setProjects] = useState<FlowProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [scenes, setScenes] = useState<FlowScene[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState("");
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
  const qaResults = useMemo(
    () => Object.fromEntries(scenes.map((scene) => [scene.id, evaluateScene(scene, labels)])),
    [labels, scenes],
  );
  const selectedResult = selectedScene ? qaResults[selectedScene.id] : null;
  const averageReady = average(Object.values(qaResults).map((result) => result.score));
  const readyCount = Object.values(qaResults).filter((result) => result.ready).length;

  const refreshScores = async () => {
    if (!selectedProjectId) return;
    const now = new Date().toISOString();
    await Promise.all(
      scenes.map((scene) => {
        const result = evaluateScene(scene, labels);
        const sceneHealthScore = calculateSceneHealthScore(scene);
        return db.flowScenes.update(scene.id, {
          flowReadyScore: result.score,
          sceneHealthScore,
          updatedAt: now,
        });
      }),
    );

    const nextScenes = await db.flowScenes
      .where("projectId")
      .equals(selectedProjectId)
      .sortBy("sceneNumber");
    setScenes(nextScenes);
    setMessage(labels.refreshed);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={labels.title} description={labels.description} />

      <AppCard>
        <div className="flex items-start gap-3">
          <BadgeCheck className="mt-1 h-5 w-5 text-accent" aria-hidden="true" />
          <div>
            <h2 className="card-title">{labels.whatIsQa}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{labels.qaExplanation}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{labels.autoExplanation}</p>
          </div>
        </div>
      </AppCard>

      {projects.length === 0 ? (
        <AppCard>
          <h2 className="section-title">{labels.emptyProjectTitle}</h2>
          <p className="muted-text mt-3">{labels.emptyProjectDescription}</p>
          <AppButton href="/import" className="mt-6 w-fit">
            {labels.goImport}
          </AppButton>
        </AppCard>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
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
              <h2 className="card-title">{labels.flowReadyScore}</h2>
              <div className="mt-4 flex items-center justify-center">
                <ScoreRing value={averageReady} label={labels.average} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric label={labels.readyScenes} value={`${readyCount}/${scenes.length}`} />
                <Metric label={labels.totalScenes} value={`${scenes.length}`} />
              </div>
              <AppButton type="button" className="mt-5 w-full" onClick={refreshScores}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                {labels.refresh}
              </AppButton>
              {message ? <p className="mt-3 text-sm leading-6 text-muted">{message}</p> : null}
            </AppCard>

            <AppCard>
              <h2 className="card-title">{labels.sceneList}</h2>
              {scenes.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-muted">{labels.emptySceneDescription}</p>
              ) : (
                <div className="mt-4 space-y-2">
                  {scenes.map((scene) => {
                    const result = qaResults[scene.id];
                    return (
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
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-semibold">
                            {labels.sceneNumber(scene.sceneNumber)} {scene.title}
                          </p>
                          <AppBadge variant={result.ready ? "success" : "warning"}>
                            {result.score}
                          </AppBadge>
                        </div>
                        <AppProgress value={result.score} className="mt-3" />
                      </button>
                    );
                  })}
                </div>
              )}
            </AppCard>
          </aside>

          <section className="space-y-6">
            {!selectedScene || !selectedResult ? (
              <AppCard>
                <h2 className="section-title">{labels.emptySceneTitle}</h2>
                <p className="muted-text mt-3">{labels.emptySceneDescription}</p>
                <AppButton href="/storyboard" className="mt-6 w-fit">
                  {labels.goStoryboard}
                </AppButton>
              </AppCard>
            ) : (
              <>
                <AppCard>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="caption-text">{labels.exportCheck}</p>
                      <h2 className="section-title mt-1">
                        {labels.sceneNumber(selectedScene.sceneNumber)} {selectedScene.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {selectedResult.ready ? labels.sceneReady : labels.sceneNeedsWork}
                      </p>
                    </div>
                    <ScoreRing value={selectedResult.score} label={labels.flowReadyScore} size="sm" />
                  </div>
                </AppCard>

                <div className="grid gap-4 md:grid-cols-2">
                  {selectedResult.checks.map((check) => (
                    <CheckCard key={check.key} check={check} />
                  ))}
                </div>

                <AppCard>
                  <h2 className="card-title">{labels.fixList}</h2>
                  {selectedResult.missing.length === 0 ? (
                    <div className="mt-4 flex items-start gap-3 rounded-radius-sm border border-border bg-background p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" aria-hidden="true" />
                      <p className="text-sm leading-6 text-muted">{labels.noFixes}</p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {selectedResult.missing.map((check) => (
                        <div key={check.key} className="flex items-start gap-3 rounded-radius-sm border border-border bg-background p-4">
                          <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" aria-hidden="true" />
                          <div>
                            <p className="text-sm font-semibold">{check.label}</p>
                            <p className="mt-1 text-sm leading-6 text-muted">{check.fix}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </AppCard>
              </>
            )}
          </section>
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

function CheckCard({ check }: { check: QACheck }) {
  return (
    <AppCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="card-title">{check.label}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{check.fix}</p>
        </div>
        <AppBadge variant={check.passed ? "success" : "warning"}>
          {check.points}/{check.maxPoints}
        </AppBadge>
      </div>
      <AppProgress value={(check.points / check.maxPoints) * 100} className="mt-4" />
    </AppCard>
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

function evaluateScene(scene: FlowScene, labels: (typeof copy)["en"] | (typeof copy)["zh-TW"]): QAResult {
  const checks: QACheck[] = [
    {
      key: "story",
      label: labels.checkStory,
      passed: hasText(scene.storyText) && hasText(scene.goal),
      points: hasText(scene.storyText) && hasText(scene.goal) ? 15 : hasText(scene.storyText) || hasText(scene.goal) ? 8 : 0,
      maxPoints: 15,
      fix: labels.fixStory,
    },
    {
      key: "hero",
      label: labels.checkHero,
      passed: scene.heroImageStatus === "ready" && hasText(scene.heroImagePrompt),
      points: scene.heroImageStatus === "ready" && hasText(scene.heroImagePrompt) ? 15 : hasText(scene.heroImagePrompt) ? 8 : 0,
      maxPoints: 15,
      fix: labels.fixHero,
    },
    {
      key: "prompt",
      label: labels.checkPrompt,
      passed: scene.flowPromptStatus === "ready" && hasText(scene.flowAnimationPrompt),
      points: scene.flowPromptStatus === "ready" && hasText(scene.flowAnimationPrompt) ? 20 : hasText(scene.flowAnimationPrompt) ? 10 : 0,
      maxPoints: 20,
      fix: labels.fixPrompt,
    },
    {
      key: "continuity",
      label: labels.checkContinuity,
      passed: hasText(scene.continuityNote) || hasText(scene.transition),
      points: hasText(scene.continuityNote) || hasText(scene.transition) ? 15 : 0,
      maxPoints: 15,
      fix: labels.fixContinuity,
    },
    {
      key: "ending",
      label: labels.checkEnding,
      passed: scene.endingFrameStatus === "available",
      points: scene.endingFrameStatus === "available" ? 15 : 0,
      maxPoints: 15,
      fix: labels.fixEnding,
    },
    {
      key: "audio",
      label: labels.checkAudio,
      passed: hasText(scene.voiceOver) || hasText(scene.subtitle),
      points: hasText(scene.voiceOver) && hasText(scene.subtitle) ? 10 : hasText(scene.voiceOver) || hasText(scene.subtitle) ? 6 : 0,
      maxPoints: 10,
      fix: labels.fixAudio,
    },
    {
      key: "duration",
      label: labels.checkDuration,
      passed: scene.durationSec >= 1 && scene.durationSec <= 8,
      points: scene.durationSec >= 1 && scene.durationSec <= 8 ? 10 : 0,
      maxPoints: 10,
      fix: labels.fixDuration,
    },
  ];

  const score = checks.reduce((sum, check) => sum + check.points, 0);
  const missing = checks.filter((check) => !check.passed);
  return { score, checks, missing, ready: score >= 80 && missing.length === 0 };
}

function hasText(value: string) {
  return value.trim().length > 0;
}

const copy = {
  en: {
    title: "Flow QA",
    description: "Check Flow Ready Score, Hero Image quality, prompt completeness, consistency, and Ending Frame availability.",
    whatIsQa: "What Flow QA Checks",
    qaExplanation:
      "Flow QA checks whether each scene has enough production data to be sent to Google Flow and later exported cleanly.",
    autoExplanation:
      "The system auto-scores fields it can verify: text completeness, statuses, duration, hero image readiness, prompt readiness, continuity notes, audio/subtitles, and ending frame availability. It does not judge artistic quality like a human reviewer.",
    emptyProjectTitle: "Create or import a Flow Project first.",
    emptyProjectDescription: "QA runs against Flow Scenes inside a project.",
    goImport: "Go to Multimodal Import",
    projectLabel: "Flow Project",
    noBrand: "No brand specified.",
    flowReadyScore: "Flow Ready Score",
    average: "Average",
    readyScenes: "Ready",
    totalScenes: "Scenes",
    refresh: "Recalculate Scores",
    refreshed: "Flow Ready Scores recalculated.",
    sceneList: "Scene QA",
    emptySceneTitle: "Create Flow Scenes first.",
    emptySceneDescription: "Scenes from Storyboard or Flow Scenes will appear here for QA.",
    goStoryboard: "Go to Flow Storyboard",
    sceneNumber: (sceneNumber: number) => `Scene ${sceneNumber}`,
    exportCheck: "Export Check",
    sceneReady: "This scene is ready for Google Flow handoff and export.",
    sceneNeedsWork: "This scene still has missing items before Flow handoff.",
    fixList: "Fix List",
    noFixes: "No missing items. This scene passes the automatic QA checklist.",
    checkStory: "Scene Brief",
    checkHero: "Hero Image",
    checkPrompt: "Google Flow Prompt",
    checkContinuity: "Continuity",
    checkEnding: "Ending Frame",
    checkAudio: "Voice / Subtitle",
    checkDuration: "Duration",
    fixStory: "Add a clear scene goal and story text.",
    fixHero: "Prepare the Hero Image prompt and mark the Hero Image as ready.",
    fixPrompt: "Write the Google Flow prompt and mark it as ready.",
    fixContinuity: "Add transition or continuity notes for how this scene connects.",
    fixEnding: "Save an available ending frame for this scene.",
    fixAudio: "Add voice over or subtitle text if this scene has narration or captions.",
    fixDuration: "Keep Google Flow scene duration between 1 and 8 seconds.",
  },
  "zh-TW": {
    title: "Flow 品檢",
    description: "檢查 Flow Ready Score、主視覺品質、提示詞完整度、一致性與結尾畫面可用性。",
    whatIsQa: "Flow 品檢檢查什麼",
    qaExplanation: "Flow 品檢會檢查每個場景是否具備足夠資料，可以送進 Google Flow 製作，並能乾淨地匯出交付。",
    autoExplanation:
      "系統會自動判定可量化欄位：文字完整度、狀態、秒數、主視覺是否就緒、提示詞是否就緒、連續性備註、旁白/字幕、結尾畫面是否可用。它不會取代人工美術判斷，例如構圖好不好看或風格是否精準。",
    emptyProjectTitle: "請先建立或匯入 Flow 專案。",
    emptyProjectDescription: "品檢會針對專案內的 Flow 場景執行。",
    goImport: "前往多模態匯入",
    projectLabel: "Flow 專案",
    noBrand: "尚未指定品牌。",
    flowReadyScore: "Flow 準備分數",
    average: "平均",
    readyScenes: "就緒",
    totalScenes: "場景",
    refresh: "重新計算分數",
    refreshed: "已重新計算 Flow 準備分數。",
    sceneList: "場景品檢",
    emptySceneTitle: "請先建立 Flow 場景。",
    emptySceneDescription: "分鏡或 Flow 場景建立後，會出現在這裡進行品檢。",
    goStoryboard: "前往 Flow 分鏡",
    sceneNumber: (sceneNumber: number) => `場景 ${sceneNumber}`,
    exportCheck: "匯出檢查",
    sceneReady: "此場景已通過自動品檢，可以交付到 Google Flow 與匯出。",
    sceneNeedsWork: "此場景還有缺項，建議補齊後再交付到 Flow。",
    fixList: "修正清單",
    noFixes: "沒有缺項。此場景通過自動品檢清單。",
    checkStory: "場景簡報",
    checkHero: "主視覺圖片",
    checkPrompt: "Google Flow 提示詞",
    checkContinuity: "連續性",
    checkEnding: "結尾畫面",
    checkAudio: "旁白 / 字幕",
    checkDuration: "秒數",
    fixStory: "補上清楚的場景目標與故事文字。",
    fixHero: "準備主視覺提示詞，並將主視覺狀態標記為就緒。",
    fixPrompt: "撰寫 Google Flow 提示詞，並將提示詞狀態標記為就緒。",
    fixContinuity: "補上轉場或連續性備註，說明此場景如何銜接。",
    fixEnding: "為此場景儲存可用的結尾畫面。",
    fixAudio: "如果此場景需要敘事或字幕，請補上旁白或字幕文字。",
    fixDuration: "建議 Google Flow 單場秒數維持在 1 到 8 秒。",
  },
} as const;
