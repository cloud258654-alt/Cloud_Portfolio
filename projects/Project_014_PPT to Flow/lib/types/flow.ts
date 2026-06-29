export type FlowProject = {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  brandName: string;
  targetAudience: string;
  targetDurationSec: number;
  targetSceneCount: number;
  language: "zh-TW" | "en" | "ja";
  flowStatus:
    | "draft"
    | "storyboarding"
    | "prompting"
    | "ready_for_flow"
    | "in_flow_production"
    | "completed";
  progressPercent: number;
  currentSceneNumber?: number;
  googleFlowReadyScore?: number;
  createdAt: string;
  updatedAt: string;
};

export type FlowStoryboard = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  targetDurationSec: number;
  targetSceneCount: number;
  storyArc:
    | "conflict_discovery_transformation"
    | "problem_solution_result"
    | "brand_journey"
    | "custom";
  status: "draft" | "in_progress" | "ready_for_scene_production" | "completed";
  createdAt: string;
  updatedAt: string;
};

export type FlowScene = {
  id: string;
  projectId: string;
  storyboardId?: string;
  sceneNumber: number;
  title: string;

  goal: string;
  storyBeat:
    | "opening"
    | "conflict"
    | "pain"
    | "question"
    | "discovery"
    | "transformation"
    | "future"
    | "ending"
    | "custom";
  storyText: string;
  emotion:
    | "neutral"
    | "curious"
    | "concerned"
    | "thinking"
    | "hopeful"
    | "excited"
    | "confident"
    | "happy"
    | "inspired"
    | "custom";
  durationSec: number;
  camera:
    | "wide"
    | "medium"
    | "close_up"
    | "slow_dolly"
    | "orbit"
    | "tracking"
    | "drone"
    | "logo_push"
    | "custom";

  heroImagePrompt: string;
  heroImageStatus: "not_started" | "drafted" | "ready" | "needs_revision";
  flowAnimationPrompt: string;
  flowPromptStatus: "not_started" | "drafted" | "ready" | "needs_revision";
  endingFrameStatus: "not_available" | "available" | "needs_revision";

  voiceOver: string;
  subtitle: string;
  music: string;
  sfx: string;

  transition: string;
  continuityNote: string;
  endingFrameNote: string;

  flowReadyScore: number;
  sceneHealthScore: number;
  createdAt: string;
  updatedAt: string;
};

export type FlowReadyScore = {
  overall: number;
  heroImageQuality: number;
  promptCompleteness: number;
  characterConsistency: number;
  lightingConsistency: number;
  cameraContinuity: number;
  endingFrameAvailable: boolean;
  sceneDurationSec: number;
  readyForGoogleFlow: boolean;
};

export type FlowExportPackage = {
  id: string;
  projectId: string;
  sceneId: string;
  heroImageFileName?: string;
  endingFrameFileName?: string;
  promptMarkdown: string;
  voiceOverText: string;
  subtitleText: string;
  qaChecklistMarkdown: string;
  createdAt: string;
};
