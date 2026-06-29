import type { FlowProject, FlowScene } from "@/lib/types/flow";

export const pipeline = [
  "PPT / Idea",
  "Story Planner",
  "Flow Storyboard",
  "Hero Image",
  "Google Flow",
  "Ending Frame",
  "Next Flow Scene",
  "Flow Export Package",
];

export const statusLabels: Record<FlowProject["flowStatus"], string> = {
  draft: "Draft",
  storyboarding: "Storyboarding",
  prompting: "Prompting",
  ready_for_flow: "Ready for Flow",
  in_flow_production: "In Flow Production",
  completed: "Completed",
};

export const storyBeatOptions: FlowScene["storyBeat"][] = [
  "opening",
  "conflict",
  "pain",
  "question",
  "discovery",
  "transformation",
  "future",
  "ending",
  "custom",
];

export const emotionOptions: FlowScene["emotion"][] = [
  "neutral",
  "curious",
  "concerned",
  "thinking",
  "hopeful",
  "excited",
  "confident",
  "happy",
  "inspired",
  "custom",
];

export const cameraOptions: FlowScene["camera"][] = [
  "wide",
  "medium",
  "close_up",
  "slow_dolly",
  "orbit",
  "tracking",
  "drone",
  "logo_push",
  "custom",
];
