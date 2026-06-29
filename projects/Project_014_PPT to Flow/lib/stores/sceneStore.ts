import { create } from "zustand";
import type { Scene } from "@/lib/types/scene";

type SceneState = {
  scenes: Scene[];
  activeSceneId: string | null;
  setScenes: (scenes: Scene[]) => void;
  setActiveSceneId: (sceneId: string | null) => void;
  upsertScene: (scene: Scene) => void;
};

export const useSceneStore = create<SceneState>((set) => ({
  scenes: [],
  activeSceneId: null,
  setScenes: (scenes) => set({ scenes }),
  setActiveSceneId: (activeSceneId) => set({ activeSceneId }),
  upsertScene: (scene) =>
    set((state) => ({
      scenes: [
        ...state.scenes.filter((existing) => existing.id !== scene.id),
        scene,
      ].sort((a, b) => a.sceneNumber - b.sceneNumber),
    })),
}));
