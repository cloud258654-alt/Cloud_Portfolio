import { create } from "zustand";
import { db } from "@/lib/db";
import type { Workspace } from "@/lib/types/workspace";

type WorkspaceInput = {
  name: string;
  description: string;
  ownerName?: string;
  defaultLanguage: Workspace["defaultLanguage"];
};

type WorkspaceState = {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  loading: boolean;
  error: string | null;
  loadWorkspaces: () => Promise<Workspace[]>;
  createWorkspace: (input: WorkspaceInput) => Promise<Workspace>;
  updateWorkspace: (
    workspaceId: string,
    input: Partial<WorkspaceInput>,
  ) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  setActiveWorkspace: (workspaceId: string | null) => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  activeWorkspaceId: null,
  loading: false,
  error: null,
  loadWorkspaces: async () => {
    set({ loading: true, error: null });
    try {
      const workspaces = await db.workspaces.orderBy("updatedAt").reverse().toArray();
      set((state) => ({
        workspaces,
        activeWorkspaceId:
          state.activeWorkspaceId ?? workspaces.at(0)?.id ?? null,
        loading: false,
      }));
      return workspaces;
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
      return [];
    }
  },
  createWorkspace: async (input) => {
    const now = new Date().toISOString();
    const workspace: Workspace = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    await db.workspaces.add(workspace);
    set((state) => ({
      workspaces: [workspace, ...state.workspaces],
      activeWorkspaceId: workspace.id,
      error: null,
    }));
    return workspace;
  },
  updateWorkspace: async (workspaceId, input) => {
    const updatedAt = new Date().toISOString();
    await db.workspaces.update(workspaceId, { ...input, updatedAt });
    set((state) => ({
      workspaces: state.workspaces.map((workspace) =>
        workspace.id === workspaceId
          ? { ...workspace, ...input, updatedAt }
          : workspace,
      ),
      error: null,
    }));
  },
  deleteWorkspace: async (workspaceId) => {
    await db.transaction("rw", db.workspaces, db.flowProjects, async () => {
      await db.flowProjects.where("workspaceId").equals(workspaceId).delete();
      await db.workspaces.delete(workspaceId);
    });

    set((state) => {
      const workspaces = state.workspaces.filter(
        (workspace) => workspace.id !== workspaceId,
      );
      return {
        workspaces,
        activeWorkspaceId:
          state.activeWorkspaceId === workspaceId
            ? workspaces.at(0)?.id ?? null
            : state.activeWorkspaceId,
        error: null,
      };
    });
  },
  setActiveWorkspace: (activeWorkspaceId) => set({ activeWorkspaceId }),
}));

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected workspace error";
}
