import { PlaceholderPanel } from "@/components/shared/PlaceholderPanel";

export default function QAPage() {
  return (
    <PlaceholderPanel
      title="Flow QA"
      description="Check Flow Ready Score, Hero Image quality, prompt completeness, consistency, and Ending Frame availability."
      stages={["Flow Ready Score", "Continuity", "Export Check"]}
    />
  );
}
