import type { Project } from "@/lib/types/project";
import type { ProjectBible } from "@/lib/types/bible";
import type { Scene } from "@/lib/types/scene";
import type { ExportJob } from "@/lib/types/export";
import type { PromptPackage } from "@/lib/types/prompt";

export type FlowDirectorSchema = {
  projects: Project;
  scenes: Scene;
  projectBibles: ProjectBible;
  promptPackages: PromptPackage;
  exportJobs: ExportJob;
};

export const dbVersion = 1;

export const stores = {
  projects: "id, name, brandName, status, createdAt, updatedAt",
  scenes: "id, projectId, sceneNumber, title, qaScore, createdAt, updatedAt",
  projectBibles: "id, projectId, createdAt, updatedAt",
  promptPackages: "id, projectId, sceneId, createdAt, updatedAt",
  exportJobs: "id, projectId, format, fileName, createdAt",
};
