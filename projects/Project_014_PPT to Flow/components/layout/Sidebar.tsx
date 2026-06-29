"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  Captions,
  Car,
  Clapperboard,
  Component,
  Download,
  FileText,
  Home,
  Image,
  ImagePlus,
  Images,
  Map,
  Mic2,
  PanelsTopLeft,
  Settings,
  SquareStack,
  TimerReset,
  UploadCloud,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, type TranslationKey } from "@/lib/i18n";

const navItems: { labelKey: TranslationKey; href: string; icon: typeof Home }[] = [
  { labelKey: "nav.dashboard", href: "/dashboard", icon: Home },
  { labelKey: "nav.import", href: "/import", icon: UploadCloud },
  { labelKey: "nav.projects", href: "/projects", icon: PanelsTopLeft },
  { labelKey: "nav.storyboard", href: "/storyboard", icon: Clapperboard },
  { labelKey: "nav.projectBible", href: "/project-bible", icon: BookOpen },
  { labelKey: "nav.characters", href: "/characters", icon: Users },
  { labelKey: "nav.vehicles", href: "/vehicles", icon: Car },
  { labelKey: "nav.environments", href: "/environments", icon: Map },
  { labelKey: "nav.scenes", href: "/scenes", icon: Image },
  { labelKey: "nav.heroImages", href: "/hero-images", icon: ImagePlus },
  { labelKey: "nav.endingFrames", href: "/ending-frames", icon: Images },
  { labelKey: "nav.prompts", href: "/prompts", icon: FileText },
  { labelKey: "nav.voice", href: "/voice", icon: Mic2 },
  { labelKey: "nav.subtitles", href: "/subtitles", icon: Captions },
  { labelKey: "nav.timeline", href: "/flow-timeline", icon: TimerReset },
  { labelKey: "nav.qa", href: "/qa", icon: BadgeCheck },
  { labelKey: "nav.export", href: "/export", icon: Download },
  { labelKey: "nav.designSystem", href: "/design-system", icon: Component },
  { labelKey: "nav.settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 overflow-y-auto border-r border-border bg-surface px-4 py-5 lg:block">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-app bg-accent text-white">
          <SquareStack className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Google Flow</p>
          <p className="text-xs text-muted">Director OS</p>
        </div>
      </Link>

      <nav className="space-y-1" aria-label={t("nav.primary")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-radius-sm px-3 text-sm font-medium text-textSecondary transition",
                active && "bg-dark text-white",
                !active && "hover:bg-surfaceMuted hover:text-textPrimary",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}