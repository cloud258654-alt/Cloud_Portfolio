import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-app border border-border bg-surface px-3 text-muted">
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate text-sm">Search projects, scenes, prompts</span>
        </div>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-app border border-border bg-surface text-text"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
