import { AppBadge } from "@/components/ui/AppBadge";
import { AppCard } from "@/components/ui/AppCard";
import { PlaceholderPanel } from "@/components/shared/PlaceholderPanel";

const scenes = ["Scene 01", "Scene 02", "Scene 03"];

export default function FlowTimelinePage() {
  return (
    <div className="space-y-6">
      <PlaceholderPanel
        title="Flow Timeline"
        description="Review the Google Flow timeline from Hero Image through Flow Output and Ending Frame."
        stages={["Hero Image", "Google Flow", "Ending Frame"]}
      />
      <AppCard variant="timeline">
        <div className="space-y-4">
          {scenes.map((scene) => (
            <div
              key={scene}
              className="grid gap-3 rounded-radius-md border border-border bg-background p-4 md:grid-cols-[120px_1fr]"
            >
              <p className="card-title">{scene}</p>
              <div className="flex flex-wrap items-center gap-3">
                <AppBadge variant="completed">Hero Image</AppBadge>
                <span className="caption-text">to</span>
                <AppBadge variant="inProgress">Google Flow</AppBadge>
                <span className="caption-text">to</span>
                <AppBadge variant="review">Ending Frame</AppBadge>
              </div>
            </div>
          ))}
        </div>
      </AppCard>
    </div>
  );
}
