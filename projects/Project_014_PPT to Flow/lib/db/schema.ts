import type { Project } from "@/lib/types/project";
import type { ProjectBible } from "@/lib/types/bible";
import type { Scene } from "@/lib/types/scene";
import type { ExportJob } from "@/lib/types/export";
import type {
  FlowExportPackage,
  FlowProject,
  FlowScene,
  FlowStoryboard,
} from "@/lib/types/flow";
import type { PromptPackage } from "@/lib/types/prompt";
import type { Workspace } from "@/lib/types/workspace";

export type FlowDirectorSchema = {
  workspaces: Workspace;
  projects: Project;
  scenes: Scene;
  flowProjects: FlowProject;
  flowStoryboards: FlowStoryboard;
  flowScenes: FlowScene;
  projectBibles: ProjectBible;
  promptPackages: PromptPackage;
  flowExportPackages: FlowExportPackage;
  exportJobs: ExportJob;
};

export const dbVersion = 4;

export const stores = {
  workspaces: "id, name, defaultLanguage, createdAt, updatedAt",
  projects: "id, name, brandName, status, createdAt, updatedAt",
  scenes: "id, projectId, sceneNumber, title, qaScore, createdAt, updatedAt",
  flowProjects:
    "id, workspaceId, name, brandName, flowStatus, language, progressPercent, updatedAt, createdAt",
  flowStoryboards:
    "id, projectId, status, storyArc, updatedAt, createdAt",
  flowScenes:
    "id, projectId, storyboardId, sceneNumber, updatedAt, storyBeat, emotion, camera, heroImageStatus, flowPromptStatus, endingFrameStatus, flowReadyScore, sceneHealthScore",
  projectBibles: "id, projectId, createdAt, updatedAt",
  promptPackages: "id, projectId, sceneId, createdAt, updatedAt",
  flowExportPackages: "id, projectId, sceneId, createdAt",
  exportJobs: "id, projectId, format, fileName, createdAt",
};
