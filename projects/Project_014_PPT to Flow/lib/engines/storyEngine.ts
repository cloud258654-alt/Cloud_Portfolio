import type { Project } from "@/lib/types/project";

export function createStoryboardSeed(project: Project) {
  return {
    projectId: project.id,
    targetDurationSec: project.targetDurationSec,
    beats: [],
  };
}
