import { PlaceholderPanel } from "@/components/shared/PlaceholderPanel";

export default function EndingFramesPage() {
  return (
    <PlaceholderPanel
      title="Ending Frames"
      description="Track ending frame availability so every Flow Scene can bridge cleanly into the next shot."
      stages={["Previous Flow Output", "Ending Frame", "Next Flow Scene"]}
    />
  );
}
