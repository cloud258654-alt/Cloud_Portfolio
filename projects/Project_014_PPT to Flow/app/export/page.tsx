import { PlaceholderPanel } from "@/components/shared/PlaceholderPanel";

export default function ExportPage() {
  return (
    <PlaceholderPanel
      title="Flow Export"
      description="Export the Flow Export Package with Hero Image reference, Ending Frame reference, prompts, voice over, subtitles, and QA checklist."
      stages={["Flow Prompt", "Assets", "Export Package"]}
    />
  );
}
