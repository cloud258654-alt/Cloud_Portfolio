import { PlaceholderPanel } from "@/components/shared/PlaceholderPanel";

export default function HeroImagesPage() {
  return (
    <PlaceholderPanel
      title="Hero Images"
      description="Prepare reference-ready hero images for each Flow Scene before prompting in Google Flow."
      stages={["Scene Reference", "Hero Image", "Flow Ready"]}
    />
  );
}
