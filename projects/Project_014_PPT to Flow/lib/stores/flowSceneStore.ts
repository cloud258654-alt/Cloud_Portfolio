import { create } from "zustand";
import { db } from "@/lib/db";
import { calculateSceneHealthScore } from "@/lib/engines/sceneHealthEngine";
import type { FlowScene } from "@/lib/types/flow";
import { getErrorMessage } from "@/lib/utils";

export type CreateFlowSceneInput = Omit<
  FlowScene,
  "id" | "createdAt" | "updatedAt" | "sceneNumber" | "sceneHealthScore"
> & {
  sceneNumber?: number;
  sceneHealthScore?: number;
};

export type UpdateFlowSceneInput = Partial<
  Omit<FlowScene, "id" | "createdAt" | "updatedAt">
>;

type FlowSceneState = {
  scenes: FlowScene[];
  activeSceneId: string | null;
  loading: boolean;
  error: string | null;
  loadScenesByProject: (projectId: string) => Promise<FlowScene[]>;
  loadScenesByStoryboard: (storyboardId: string) => Promise<FlowScene[]>;
  createScene: (input: CreateFlowSceneInput) => Promise<FlowScene>;
  updateScene: (sceneId: string, input: UpdateFlowSceneInput) => Promise<void>;
  deleteScene: (sceneId: string) => Promise<void>;
  setActiveScene: (sceneId: string | null) => void;
  reorderSceneNumbers: (sceneIds: string[]) => Promise<void>;
  calculateSceneHealthScore: (scene: Partial<FlowScene>) => number;
};

export const useFlowSceneStore = create<FlowSceneState>((set, get) => ({
  scenes: [],
  activeSceneId: null,
  loading: false,
  error: null,
  loadScenesByProject: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const scenes = await db.flowScenes
        .where("projectId")
        .equals(projectId)
        .sortBy("sceneNumber");
      set((state) => ({
        scenes,
        activeSceneId: state.activeSceneId ?? scenes.at(0)?.id ?? null,
        loading: false,
      }));
      return scenes;
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
      return [];
    }
  },
  loadScenesByStoryboard: async (storyboardId) => {
    set({ loading: true, error: null });
    try {
      const scenes = await db.flowScenes
        .where("storyboardId")
        .equals(storyboardId)
        .sortBy("sceneNumber");
      set((state) => ({
        scenes,
        activeSceneId: state.activeSceneId ?? scenes.at(0)?.id ?? null,
        loading: false,
      }));
      return scenes;
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
      return [];
    }
  },
  createScene: async (input) => {
    const now = new Date().toISOString();
    const sceneNumber =
      input.sceneNumber ??
      ((await db.flowScenes
        .where("projectId")
        .equals(input.projectId)
        .count()) + 1);
    const sceneDraft = { ...input, sceneNumber };
    const scene: FlowScene = {
      id: crypto.randomUUID(),
      ...sceneDraft,
      sceneHealthScore: input.sceneHealthScore ?? calculateSceneHealthScore(sceneDraft),
      createdAt: now,
      updatedAt: now,
    };

    await db.flowScenes.add(scene);
    set((state) => ({
      scenes: [...state.scenes, scene].sort((a, b) => a.sceneNumber - b.sceneNumber),
      activeSceneId: scene.id,
      error: null,
    }));
    return scene;
  },
  updateScene: async (sceneId, input) => {
    const existing = get().scenes.find((scene) => scene.id === sceneId);
    const nextScene = existing ? { ...existing, ...input } : input;
    const updatedAt = new Date().toISOString();
    const sceneHealthScore = calculateSceneHealthScore(nextScene);

    await db.flowScenes.update(sceneId, { ...input, sceneHealthScore, updatedAt });
    set((state) => ({
      scenes: state.scenes
        .map((scene) =>
          scene.id === sceneId
            ? { ...scene, ...input, sceneHealthScore, updatedAt }
            : scene,
        )
        .sort((a, b) => a.sceneNumber - b.sceneNumber),
      error: null,
    }));
  },
  deleteScene: async (sceneId) => {
    await db.flowScenes.delete(sceneId);
    set((state) => {
      const scenes = state.scenes
        .filter((scene) => scene.id !== sceneId)
        .map((scene, index) => ({ ...scene, sceneNumber: index + 1 }));
      return {
        scenes,
        activeSceneId:
          state.activeSceneId === sceneId ? scenes.at(0)?.id ?? null : state.activeSceneId,
        error: null,
      };
    });
    await get().reorderSceneNumbers(get().scenes.map((scene) => scene.id));
  },
  setActiveScene: (activeSceneId) => set({ activeSceneId }),
  reorderSceneNumbers: async (sceneIds) => {
    const updatedAt = new Date().toISOString();
    await db.transaction("rw", db.flowScenes, async () => {
      await Promise.all(
        sceneIds.map((sceneId, index) =>
          db.flowScenes.update(sceneId, {
            sceneNumber: index + 1,
            updatedAt,
          }),
        ),
      );
    });
    set((state) => ({
      scenes: state.scenes
        .map((scene) => {
          const index = sceneIds.indexOf(scene.id);
          return index >= 0 ? { ...scene, sceneNumber: index + 1, updatedAt } : scene;
        })
        .sort((a, b) => a.sceneNumber - b.sceneNumber),
    }));
  },
  calculateSceneHealthScore: calculateSceneHealthScore,
}));
