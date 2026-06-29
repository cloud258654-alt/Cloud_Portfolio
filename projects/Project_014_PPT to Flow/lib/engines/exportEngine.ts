import type { Scene } from "@/lib/types/scene";

export function scenesToSrt(scenes: Scene[]) {
  let cursor = 0;

  return scenes
    .sort((a, b) => a.sceneNumber - b.sceneNumber)
    .map((scene, index) => {
      const start = cursor;
      const end = cursor + scene.durationSec;
      cursor = end;

      return [
        index + 1,
        `${formatSrtTime(start)} --> ${formatSrtTime(end)}`,
        scene.subtitle,
      ].join("\n");
    })
    .join("\n\n");
}

function formatSrtTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},000`;
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}
