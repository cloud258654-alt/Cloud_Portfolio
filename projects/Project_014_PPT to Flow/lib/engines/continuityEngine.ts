import type { Scene } from "@/lib/types/scene";

export function scoreSceneContinuity(scene: Scene) {
  const requiredFields = [
    scene.goal,
    scene.storyBeat,
    scene.heroImagePrompt,
    scene.flowAnimationPrompt,
    scene.voiceOver,
    scene.subtitle,
  ];

  const completed = requiredFields.filter(Boolean).length;
  return Math.round((completed / requiredFields.length) * 100);
}
