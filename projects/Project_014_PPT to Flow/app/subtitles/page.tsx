import { PlaceholderPanel } from "@/components/shared/PlaceholderPanel";

export default function SubtitlesPage() {
  return (
    <PlaceholderPanel
      title="Subtitles"
      description="Prepare subtitle lines, reading speed, timestamps, and SRT content for the Flow Export Package."
      stages={["Subtitle Lines", "Timing", "SRT Export"]}
    />
  );
}
