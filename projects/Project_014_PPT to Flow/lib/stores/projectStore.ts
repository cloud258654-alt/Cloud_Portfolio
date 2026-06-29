import { create } from "zustand";
import type { Project } from "@/lib/types/project";

type ProjectState = {
  projects: Project[];
  activeProjectId: string | null;
  setProjects: (projects: Project[]) => void;
  setActiveProjectId: (projectId: string | null) => void;
  upsertProject: (project: Project) => void;
};

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  activeProjectId: null,
  setProjects: (projects) => set({ projects }),
  setActiveProjectId: (activeProjectId) => set({ activeProjectId }),
  upsertProject: (project) =>
    set((state) => ({
      projects: [
        project,
        ...state.projects.filter((existing) => existing.id !== project.id),
      ],
    })),
}));
