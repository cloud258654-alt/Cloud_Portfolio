"use client";

import { Bell, Languages, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function Topbar() {
  const { t, toggleLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-app border border-border bg-surface px-3 text-muted">
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate text-sm">{t("topbar.search")}</span>
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-app border border-border bg-surface px-3 text-sm font-semibold text-text transition hover:bg-surfaceMuted"
          aria-label={t("topbar.languageToggle")}
          onClick={toggleLanguage}
          title={t("topbar.languageToggle")}
        >
          <Languages className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t("topbar.currentLanguage")}</span>
          <span className="text-muted">/</span>
          <span>{t("topbar.nextLanguage")}</span>
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-app border border-border bg-surface text-text transition hover:bg-surfaceMuted"
          aria-label={t("topbar.notifications")}
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}