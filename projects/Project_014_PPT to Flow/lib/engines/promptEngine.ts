import type { ProjectBible } from "@/lib/types/bible";
import type { Scene } from "@/lib/types/scene";

export function buildHeroImagePrompt(scene: Scene, bible: ProjectBible) {
  return [scene.title, scene.goal, scene.camera, bible.colorBible]
    .filter(Boolean)
    .join("\n");
}

export function buildFlowAnimationPrompt(scene: Scene, bible: ProjectBible) {
  return [scene.storyBeat, scene.emotion, scene.transition, bible.motionBible]
    .filter(Boolean)
    .join("\n");
}
