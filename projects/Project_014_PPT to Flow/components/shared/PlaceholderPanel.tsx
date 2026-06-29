import { PageHeader } from "@/components/layout/PageHeader";

type PlaceholderPanelProps = {
  title: string;
  description: string;
};

export function PlaceholderPanel({ title, description }: PlaceholderPanelProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <section className="rounded-app border border-border bg-surface p-6 shadow-subtle">
        <div className="grid gap-4 md:grid-cols-3">
          {["Inputs", "Builder", "Output"].map((label) => (
            <div key={label} className="rounded-app border border-border bg-background p-4">
              <p className="text-sm font-semibold">{label}</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                This workspace is scaffolded for the next implementation pass.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
