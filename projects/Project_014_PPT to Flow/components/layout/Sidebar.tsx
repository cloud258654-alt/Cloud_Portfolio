"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  Captions,
  Car,
  Clapperboard,
  Download,
  FileText,
  Gauge,
  Home,
  Image,
  Map,
  Mic2,
  PanelsTopLeft,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Projects", href: "/projects", icon: PanelsTopLeft },
  { label: "Storyboard", href: "/storyboard", icon: Clapperboard },
  { label: "Project Bible", href: "/project-bible", icon: BookOpen },
  { label: "Characters", href: "/characters", icon: Users },
  { label: "Vehicles", href: "/vehicles", icon: Car },
  { label: "Environments", href: "/environments", icon: Map },
  { label: "Scenes", href: "/scenes", icon: Image },
  { label: "Prompts", href: "/prompts", icon: FileText },
  { label: "Voice", href: "/voice", icon: Mic2 },
  { label: "Subtitles", href: "/subtitles", icon: Captions },
  { label: "QA Center", href: "/qa", icon: BadgeCheck },
  { label: "Export", href: "/export", icon: Download },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border bg-surface px-4 py-5 lg:block">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-app bg-accent text-white">
          <Gauge className="h-5 w-5" aria-hidden="true" />
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
                "flex h-10 items-center gap-3 rounded-app px-3 text-sm font-medium text-muted transition",
                active && "bg-text text-white",
                !active && "hover:bg-background hover:text-text",
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
