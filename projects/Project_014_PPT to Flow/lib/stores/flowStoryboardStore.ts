import { create } from "zustand";
import { db } from "@/lib/db";
import type { FlowStoryboard } from "@/lib/types/flow";

type CreateStoryboardInput = Omit<
  FlowStoryboard,
  "id" | "createdAt" | "updatedAt"
>;

type UpdateStoryboardInput = Partial<
  Omit<FlowStoryboard, "id" | "createdAt" | "updatedAt">
>;

type FlowStoryboardState = {
  storyboards: FlowStoryboard[];
  activeStoryboardId: string | null;
  loading: boolean;
  error: string | null;
  loadStoryboardsByProject: (projectId: string) => Promise<FlowStoryboard[]>;
  createStoryboard: (input: CreateStoryboardInput) => Promise<FlowStoryboard>;
  updateStoryboard: (
    storyboardId: string,
    input: UpdateStoryboardInput,
  ) => Promise<void>;
  deleteStoryboard: (storyboardId: string) => Promise<void>;
  setActiveStoryboard: (storyboardId: string | null) => void;
};

export const useFlowStoryboardStore = create<FlowStoryboardState>((set) => ({
  storyboards: [],
  activeStoryboardId: null,
  loading: false,
  error: null,
  loadStoryboardsByProject: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const storyboards = await db.flowStoryboards
        .where("projectId")
        .equals(projectId)
        .reverse()
        .sortBy("updatedAt");

      set((state) => ({
        storyboards,
        activeStoryboardId: state.activeStoryboardId ?? storyboards.at(0)?.id ?? null,
        loading: false,
      }));
      return storyboards;
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
      return [];
    }
  },
  createStoryboard: async (input) => {
    const now = new Date().toISOString();
    const storyboard: FlowStoryboard = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    await db.flowStoryboards.add(storyboard);
    set((state) => ({
      storyboards: [storyboard, ...state.storyboards],
      activeStoryboardId: storyboard.id,
      error: null,
    }));
    return storyboard;
  },
  updateStoryboard: async (storyboardId, input) => {
    const updatedAt = new Date().toISOString();
    await db.flowStoryboards.update(storyboardId, { ...input, updatedAt });
    set((state) => ({
      storyboards: state.storyboards.map((storyboard) =>
        storyboard.id === storyboardId
          ? { ...storyboard, ...input, updatedAt }
          : storyboard,
      ),
      error: null,
    }));
  },
  deleteStoryboard: async (storyboardId) => {
    await db.transaction("rw", db.flowStoryboards, db.flowScenes, async () => {
      await db.flowScenes.where("storyboardId").equals(storyboardId).delete();
      await db.flowStoryboards.delete(storyboardId);
    });
    set((state) => {
      const storyboards = state.storyboards.filter(
        (storyboard) => storyboard.id !== storyboardId,
      );
      return {
        storyboards,
        activeStoryboardId:
          state.activeStoryboardId === storyboardId
            ? storyboards.at(0)?.id ?? null
            : state.activeStoryboardId,
        error: null,
      };
    });
  },
  setActiveStoryboard: (activeStoryboardId) => set({ activeStoryboardId }),
}));

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected storyboard error";
}
