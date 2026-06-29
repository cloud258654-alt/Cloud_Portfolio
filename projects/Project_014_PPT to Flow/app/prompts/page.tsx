import { PlaceholderPanel } from "@/components/shared/PlaceholderPanel";

export default function PromptsPage() {
  return (
    <PlaceholderPanel
      title="Flow Prompts"
      description="Prepare Google Flow prompts from the Project Bible, Hero Image notes, camera continuity, and Ending Frame needs."
      stages={["Prompt Draft", "Flow Review", "Flow Ready"]}
    />
  );
}
