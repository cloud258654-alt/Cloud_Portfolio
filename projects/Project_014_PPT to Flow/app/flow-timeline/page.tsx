"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clipboard, Image as ImageIcon, Play, TimerReset } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { db } from "@/lib/db";
import type { FlowProject, FlowScene } from "@/lib/types/flow";
import { useLanguage } from "@/lib/i18n";

type TimelineStep = {
  scene: FlowScene;
  startSec: number;
  endSec: number;
  nextScene: FlowScene | null;
};

export default function FlowTimelinePage() {
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
  const timeline = useMemo(() => buildTimeline(scenes), [scenes]);
  const selectedStep = timeline.find((step) => step.scene.id === selectedSceneId) ?? timeline.at(0) ?? null;
  const readyScenes = scenes.filter(isSceneFlowReady).length;
  const totalDuration = scenes.reduce((sum, scene) => sum + scene.durationSec, 0);

  const copySceneHandoff = async () => {
    if (!selectedStep) return;
    await navigator.clipboard.writeText(formatSceneHandoff(selectedStep, labels));
    setMessage(labels.sceneCopied(selectedStep.scene.sceneNumber));
  };

  const copyTimelineHandoff = async () => {
    await navigator.clipboard.writeText(timeline.map((step) => formatSceneHandoff(step, labels)).join("\n\n---\n\n"));
    setMessage(labels.timelineCopied);
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
              <div className="flex items-center gap-3">
                <TimerReset className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="card-title">{labels.timelineSummary}</h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric label={labels.scenes} value={`${scenes.length}`} />
                <Metric label={labels.duration} value={`${totalDuration}s`} />
                <Metric label={labels.flowReady} value={`${readyScenes}/${scenes.length}`} />
                <Metric label={labels.current} value={selectedStep ? `${selectedStep.scene.sceneNumber}` : "-"} />
              </div>
            </AppCard>

            <AppCard>
              <h2 className="card-title">{labels.sceneList}</h2>
              {timeline.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-muted">{labels.emptySceneDescription}</p>
              ) : (
                <div className="mt-4 space-y-2">
                  {timeline.map((step) => (
                    <button
                      key={step.scene.id}
                      type="button"
                      className={`w-full rounded-radius-sm border px-3 py-3 text-left transition ${
                        step.scene.id === selectedSceneId
                          ? "border-accent bg-surfaceMuted"
                          : "border-border bg-background hover:bg-surfaceMuted"
                      }`}
                      onClick={() => setSelectedSceneId(step.scene.id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold">
                          {labels.sceneNumber(step.scene.sceneNumber)} {step.scene.title}
                        </p>
                        <StatusBadge ready={isSceneFlowReady(step.scene)} />
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {formatClock(step.startSec)} - {formatClock(step.endSec)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </AppCard>
          </aside>

          <section className="space-y-6">
            {!selectedStep ? (
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
                      <p className="caption-text">{labels.googleFlowRun}</p>
                      <h2 className="section-title mt-1">
                        {labels.sceneNumber(selectedStep.scene.sceneNumber)} {selectedStep.scene.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {labels.timeRange(formatClock(selectedStep.startSec), formatClock(selectedStep.endSec))}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AppButton type="button" variant="outline" onClick={copySceneHandoff}>
                        <Clipboard className="h-4 w-4" aria-hidden="true" />
                        {labels.copyScene}
                      </AppButton>
                      <AppButton type="button" onClick={copyTimelineHandoff}>
                        <Clipboard className="h-4 w-4" aria-hidden="true" />
                        {labels.copyTimeline}
                      </AppButton>
                    </div>
                  </div>
                  {message ? <p className="mt-4 text-sm leading-6 text-muted">{message}</p> : null}
                </AppCard>

                <div className="grid gap-4 lg:grid-cols-3">
                  <FlowStage
                    title={labels.heroImage}
                    status={statusText(selectedStep.scene.heroImageStatus)}
                    ready={selectedStep.scene.heroImageStatus === "ready"}
                    href="/hero-images"
                    action={labels.prepareHero}
                  >
                    {selectedStep.scene.heroImageReferenceDataUrl ? (
                      <Image
                        src={selectedStep.scene.heroImageReferenceDataUrl}
                        alt={selectedStep.scene.heroImageReferenceName || labels.heroImage}
                        width={520}
                        height={280}
                        unoptimized
                        className="h-40 w-full rounded-radius-sm object-cover"
                      />
                    ) : (
                      <EmptyVisual label={labels.noHeroImage} />
                    )}
                    <PreviewText label={labels.prompt} value={selectedStep.scene.heroImagePrompt} emptyValue={labels.emptyValue} />
                  </FlowStage>

                  <FlowStage
                    title={labels.googleFlow}
                    status={statusText(selectedStep.scene.flowPromptStatus)}
                    ready={selectedStep.scene.flowPromptStatus === "ready"}
                    href="/prompts"
                    action={labels.preparePrompt}
                  >
                    <PreviewText label={labels.flowPrompt} value={selectedStep.scene.flowAnimationPrompt} emptyValue={labels.emptyValue} />
                    <PreviewText label={labels.voiceSubtitle} value={[selectedStep.scene.voiceOver, selectedStep.scene.subtitle].filter(Boolean).join("\n")} emptyValue={labels.emptyValue} />
                  </FlowStage>

                  <FlowStage
                    title={labels.endingFrame}
                    status={statusText(selectedStep.scene.endingFrameStatus)}
                    ready={selectedStep.scene.endingFrameStatus === "available"}
                    href="/ending-frames"
                    action={labels.prepareEnding}
                  >
                    {selectedStep.scene.endingFrameReferenceDataUrl ? (
                      <Image
                        src={selectedStep.scene.endingFrameReferenceDataUrl}
                        alt={selectedStep.scene.endingFrameReferenceName || labels.endingFrame}
                        width={520}
                        height={280}
                        unoptimized
                        className="h-40 w-full rounded-radius-sm object-cover"
                      />
                    ) : (
                      <EmptyVisual label={labels.noEndingFrame} />
                    )}
                    <PreviewText label={labels.bridgeToNext} value={selectedStep.nextScene ? `${selectedStep.nextScene.sceneNumber}. ${selectedStep.nextScene.title}` : labels.finalScene} emptyValue={labels.emptyValue} />
                  </FlowStage>
                </div>

                <AppCard>
                  <h2 className="card-title">{labels.howToUse}</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <InstructionStep icon={ImageIcon} title={labels.stepHeroTitle} text={labels.stepHeroText} />
                    <InstructionStep icon={Play} title={labels.stepFlowTitle} text={labels.stepFlowText} />
                    <InstructionStep icon={CheckCircle2} title={labels.stepEndingTitle} text={labels.stepEndingText} />
                  </div>
                </AppCard>

                <AppCard>
                  <h2 className="card-title">{labels.handoffPreview}</h2>
                  <pre className="mt-4 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-radius-sm border border-border bg-background p-4 text-sm leading-6 text-muted">
                    {formatSceneHandoff(selectedStep, labels)}
                  </pre>
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

function FlowStage({
  title,
  status,
  ready,
  href,
  action,
  children,
}: {
  title: string;
  status: string;
  ready: boolean;
  href: string;
  action: string;
  children: React.ReactNode;
}) {
  return (
    <AppCard className="flex min-h-[28rem] flex-col">
      <div className="flex items-start justify-between gap-3">
        <h3 className="card-title">{title}</h3>
        <AppBadge variant={ready ? "success" : "warning"}>{status}</AppBadge>
      </div>
      <div className="mt-4 flex flex-1 flex-col gap-4">{children}</div>
      <AppButton href={href} variant="outline" className="mt-5 w-full">
        {action}
      </AppButton>
    </AppCard>
  );
}

function EmptyVisual({ label }: { label: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-radius-sm border border-dashed border-border bg-background text-center text-sm leading-6 text-muted">
      {label}
    </div>
  );
}

function PreviewText({
  label,
  value,
  emptyValue,
}: {
  label: string;
  value: string;
  emptyValue: string;
}) {
  return (
    <div>
      <p className="caption-text font-semibold">{label}</p>
      <p className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap rounded-radius-sm border border-border bg-background p-3 text-sm leading-6 text-muted">
        {value || emptyValue}
      </p>
    </div>
  );
}

function InstructionStep({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ImageIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-radius-sm border border-border bg-background p-4">
      <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </div>
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

function StatusBadge({ ready }: { ready: boolean }) {
  return <AppBadge variant={ready ? "success" : "warning"}>{ready ? "Ready" : "Check"}</AppBadge>;
}

function buildTimeline(scenes: FlowScene[]): TimelineStep[] {
  let cursor = 0;
  return scenes.map((scene, index) => {
    const startSec = cursor;
    const endSec = cursor + scene.durationSec;
    cursor = endSec;
    return {
      scene,
      startSec,
      endSec,
      nextScene: scenes[index + 1] ?? null,
    };
  });
}

function isSceneFlowReady(scene: FlowScene) {
  return (
    scene.heroImageStatus === "ready" &&
    scene.flowPromptStatus === "ready" &&
    scene.endingFrameStatus === "available"
  );
}

function statusText(status: string) {
  return status.replace(/_/g, " ");
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatSceneHandoff(step: TimelineStep, labels: (typeof copy)["en"] | (typeof copy)["zh-TW"]) {
  return [
    `# ${labels.sceneNumber(step.scene.sceneNumber)} ${step.scene.title}`,
    `${labels.time}: ${formatClock(step.startSec)} - ${formatClock(step.endSec)}`,
    `${labels.next}: ${step.nextScene ? `${step.nextScene.sceneNumber}. ${step.nextScene.title}` : labels.finalScene}`,
    "",
    `## ${labels.heroImage}`,
    step.scene.heroImageReferenceName || labels.noHeroImage,
    "",
    `## ${labels.heroImagePrompt}`,
    step.scene.heroImagePrompt || labels.emptyValue,
    "",
    `## ${labels.flowPrompt}`,
    step.scene.flowAnimationPrompt || labels.emptyValue,
    "",
    `## ${labels.voiceOver}`,
    step.scene.voiceOver || labels.emptyValue,
    "",
    `## ${labels.subtitle}`,
    step.scene.subtitle || labels.emptyValue,
    "",
    `## ${labels.endingFrame}`,
    step.scene.endingFrameReferenceName || labels.noEndingFrame,
    "",
    `## ${labels.endingFrameNote}`,
    step.scene.endingFrameNote || labels.emptyValue,
  ].join("\n");
}

const copy = {
  en: {
    title: "Flow Timeline",
    description: "Review the Google Flow timeline from Hero Image through Flow Output and Ending Frame.",
    emptyProjectTitle: "Create or import a Flow Project first.",
    emptyProjectDescription: "The timeline needs scenes, prompts, hero images, and ending frames to guide Google Flow production.",
    goImport: "Go to Multimodal Import",
    projectLabel: "Flow Project",
    noBrand: "No brand specified.",
    timelineSummary: "Timeline Summary",
    scenes: "Scenes",
    duration: "Duration",
    flowReady: "Flow Ready",
    current: "Current",
    sceneList: "Scene Timeline",
    emptySceneTitle: "Create Flow Scenes first.",
    emptySceneDescription: "Scenes from Storyboard or Flow Scenes will appear here in production order.",
    goStoryboard: "Go to Flow Storyboard",
    sceneNumber: (sceneNumber: number) => `Scene ${sceneNumber}`,
    googleFlowRun: "Google Flow Run",
    timeRange: (start: string, end: string) => `${start} to ${end}`,
    copyScene: "Copy Scene Handoff",
    copyTimeline: "Copy Full Timeline",
    sceneCopied: (sceneNumber: number) => `Scene ${sceneNumber} handoff copied.`,
    timelineCopied: "Full Flow timeline copied.",
    heroImage: "Hero Image",
    googleFlow: "Google Flow",
    endingFrame: "Ending Frame",
    prepareHero: "Prepare Hero Image",
    preparePrompt: "Prepare Prompt",
    prepareEnding: "Prepare Ending Frame",
    noHeroImage: "No hero image reference yet.",
    noEndingFrame: "No ending frame reference yet.",
    prompt: "Prompt",
    flowPrompt: "Google Flow Prompt",
    voiceSubtitle: "Voice / Subtitle",
    bridgeToNext: "Bridge To Next",
    finalScene: "Final scene / no next scene",
    howToUse: "How To Use With Flow",
    stepHeroTitle: "1. Start With Hero Image",
    stepHeroText: "Use the Hero Image reference and prompt as the visual anchor before generating the scene in Google Flow.",
    stepFlowTitle: "2. Paste Google Flow Prompt",
    stepFlowText: "Paste the Flow prompt, add voice or subtitle needs if relevant, then generate the video scene.",
    stepEndingTitle: "3. Save Ending Frame",
    stepEndingText: "Take the final frame from Flow output and store it as the ending frame to bridge into the next scene.",
    handoffPreview: "Scene Handoff Preview",
    emptyValue: "Not provided.",
    time: "Time",
    next: "Next",
    heroImagePrompt: "Hero Image Prompt",
    voiceOver: "Voice Over",
    subtitle: "Subtitle",
    endingFrameNote: "Ending Frame Note",
  },
  "zh-TW": {
    title: "Flow 時間線",
    description: "檢視從主視覺、Flow 輸出到結尾畫面的 Google Flow 時間線。",
    emptyProjectTitle: "請先建立或匯入 Flow 專案。",
    emptyProjectDescription: "時間線需要場景、提示詞、主視覺與結尾畫面，才能作為 Google Flow 製作順序表。",
    goImport: "前往多模態匯入",
    projectLabel: "Flow 專案",
    noBrand: "尚未指定品牌。",
    timelineSummary: "時間線摘要",
    scenes: "場景",
    duration: "長度",
    flowReady: "Flow 就緒",
    current: "目前",
    sceneList: "場景時間線",
    emptySceneTitle: "請先建立 Flow 場景。",
    emptySceneDescription: "分鏡或 Flow 場景建立後，會依製作順序出現在這裡。",
    goStoryboard: "前往 Flow 分鏡",
    sceneNumber: (sceneNumber: number) => `場景 ${sceneNumber}`,
    googleFlowRun: "Google Flow 製作段落",
    timeRange: (start: string, end: string) => `${start} 到 ${end}`,
    copyScene: "複製本場交付",
    copyTimeline: "複製完整時間線",
    sceneCopied: (sceneNumber: number) => `已複製場景 ${sceneNumber} 交付內容。`,
    timelineCopied: "已複製完整 Flow 時間線。",
    heroImage: "主視覺圖片",
    googleFlow: "Google Flow",
    endingFrame: "結尾畫面",
    prepareHero: "準備主視覺",
    preparePrompt: "準備提示詞",
    prepareEnding: "準備結尾畫面",
    noHeroImage: "尚未建立主視覺參考。",
    noEndingFrame: "尚未建立結尾畫面參考。",
    prompt: "提示詞",
    flowPrompt: "Google Flow 提示詞",
    voiceSubtitle: "旁白 / 字幕",
    bridgeToNext: "銜接下一場",
    finalScene: "最後一幕 / 沒有下一幕",
    howToUse: "如何搭配 Flow 使用",
    stepHeroTitle: "1. 先用主視覺",
    stepHeroText: "把主視覺參考圖與提示詞當作視覺錨點，再送入 Google Flow 生成該場景。",
    stepFlowTitle: "2. 貼上 Google Flow 提示詞",
    stepFlowText: "把 Flow 提示詞貼到 Google Flow，必要時搭配旁白或字幕需求，再生成影片段落。",
    stepEndingTitle: "3. 回存結尾畫面",
    stepEndingText: "從 Flow 輸出的最後一幀取出結尾畫面，存回本系統，用來銜接下一個場景。",
    handoffPreview: "本場交付預覽",
    emptyValue: "尚未提供。",
    time: "時間",
    next: "下一場",
    heroImagePrompt: "主視覺提示詞",
    voiceOver: "旁白",
    subtitle: "字幕",
    endingFrameNote: "結尾畫面備註",
  },
} as const;
