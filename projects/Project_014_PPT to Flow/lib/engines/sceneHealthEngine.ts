import type { FlowScene } from "@/lib/types/flow";

export function calculateSceneHealthScore(scene: Partial<FlowScene>) {
  let score = 0;

  if (hasText(scene.goal) && hasText(scene.storyText)) score += 20;
  else if (hasText(scene.goal) || hasText(scene.storyText)) score += 10;
  if (typeof scene.durationSec === "number" && scene.durationSec >= 1 && scene.durationSec <= 8) {
    score += 10;
  }
  if (scene.emotion) score += 10;
  if (scene.camera) score += 10;
  if (hasText(scene.heroImagePrompt)) score += 10;
  if (hasText(scene.flowAnimationPrompt)) score += 10;
  if (hasText(scene.voiceOver)) score += 10;
  if (hasText(scene.subtitle)) score += 10;
  if (hasText(scene.transition)) score += 10;

  return Math.min(100, score);
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}
