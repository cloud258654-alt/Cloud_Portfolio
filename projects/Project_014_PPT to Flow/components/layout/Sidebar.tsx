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
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Flow Projects", href: "/projects", icon: PanelsTopLeft },
  { label: "Flow Storyboard", href: "/storyboard", icon: Clapperboard },
  { label: "Project Bible", href: "/project-bible", icon: BookOpen },
  { label: "Characters", href: "/characters", icon: Users },
  { label: "Vehicles", href: "/vehicles", icon: Car },
  { label: "Environments", href: "/environments", icon: Map },
  { label: "Flow Scenes", href: "/scenes", icon: Image },
  { label: "Hero Images", href: "/hero-images", icon: ImagePlus },
  { label: "Ending Frames", href: "/ending-frames", icon: Images },
  { label: "Flow Prompts", href: "/prompts", icon: FileText },
  { label: "Voice Over", href: "/voice", icon: Mic2 },
  { label: "Subtitles", href: "/subtitles", icon: Captions },
  { label: "Flow Timeline", href: "/flow-timeline", icon: TimerReset },
  { label: "Flow QA", href: "/qa", icon: BadgeCheck },
  { label: "Flow Export", href: "/export", icon: Download },
  { label: "Design System", href: "/design-system", icon: Component },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

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

      <nav className="space-y-1" aria-label="Primary navigation">
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
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
