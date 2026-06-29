import { create } from "zustand";
import { db } from "@/lib/db";
import type { FlowProject } from "@/lib/types/flow";
import { getErrorMessage } from "@/lib/utils";

export type CreateFlowProjectInput = Omit<
  FlowProject,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "progressPercent"
  | "googleFlowReadyScore"
> & {
  progressPercent?: number;
  googleFlowReadyScore?: number;
};

export type UpdateFlowProjectInput = Partial<
  Omit<FlowProject, "id" | "createdAt" | "updatedAt">
>;

type FlowProjectState = {
  projects: FlowProject[];
  activeProjectId: string | null;
  loading: boolean;
  error: string | null;
  loadProjectsByWorkspace: (workspaceId: string) => Promise<FlowProject[]>;
  createProject: (input: CreateFlowProjectInput) => Promise<FlowProject>;
  updateProject: (
    projectId: string,
    input: UpdateFlowProjectInput,
  ) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  setActiveProject: (projectId: string | null) => void;
};

export const useFlowProjectStore = create<FlowProjectState>((set) => ({
  projects: [],
  activeProjectId: null,
  loading: false,
  error: null,
  loadProjectsByWorkspace: async (workspaceId) => {
    set({ loading: true, error: null });
    try {
      const projects = await db.flowProjects
        .where("workspaceId")
        .equals(workspaceId)
        .reverse()
        .sortBy("updatedAt");

      set((state) => ({
        projects,
        activeProjectId: state.activeProjectId ?? projects.at(0)?.id ?? null,
        loading: false,
      }));
      return projects;
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
      return [];
    }
  },
  createProject: async (input) => {
    const now = new Date().toISOString();
    const project: FlowProject = {
      id: crypto.randomUUID(),
      progressPercent: input.progressPercent ?? 0,
      googleFlowReadyScore: input.googleFlowReadyScore ?? 0,
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    await db.flowProjects.add(project);
    set((state) => ({
      projects: [project, ...state.projects],
      activeProjectId: project.id,
      error: null,
    }));
    return project;
  },
  updateProject: async (projectId, input) => {
    const updatedAt = new Date().toISOString();
    await db.flowProjects.update(projectId, { ...input, updatedAt });
    set((state) => ({
      projects: state.projects
        .map((project) =>
          project.id === projectId ? { ...project, ...input, updatedAt } : project,
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      error: null,
    }));
  },
  deleteProject: async (projectId) => {
    await db.flowProjects.delete(projectId);
    set((state) => {
      const projects = state.projects.filter((project) => project.id !== projectId);
      return {
        projects,
        activeProjectId:
          state.activeProjectId === projectId
            ? projects.at(0)?.id ?? null
            : state.activeProjectId,
        error: null,
      };
    });
  },
  setActiveProject: (activeProjectId) => set({ activeProjectId }),
}));
