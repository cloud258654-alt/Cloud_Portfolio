"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Briefcase,
  BarChart3,
  Calculator,
  Brain,
  ClipboardList,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function AppShell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useTranslation();

  const navItems = [
    { href: "/", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/chat", label: t.nav.chat, icon: MessageSquare },
    { href: "/documents", label: t.nav.documents, icon: FileText },
    { href: "/experience", label: t.nav.experience, icon: Briefcase },
    { href: "/analytics", label: t.nav.analytics, icon: BarChart3 },
    { href: "/roi", label: t.nav.roi, icon: Calculator },
    { href: "/learn", label: t.nav.learn, icon: Brain },
    { href: "/requests", label: t.nav.requests, icon: ClipboardList },
  ];

  return (
    <html lang={lang === "zh" ? "zh-TW" : "en"}>
      <body>
        <nav style={navStyle}>
          <div style={brandStyle}>{t.common.appName.split(" ").slice(0, 2).join(" ")}</div>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={linkStyle}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            style={langToggleStyle}
          >
            {t.language.switch}
          </button>
        </nav>
        <div style={mainStyle}>{children}</div>
      </body>
    </html>
  );
}

const navStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  bottom: 0,
  width: 220,
  background: "#FFFFFF",
  borderRight: "1px solid #E5E7EB",
  padding: "16px 12px",
  display: "flex",
  flexDirection: "column",
  gap: 4,
  zIndex: 100,
};

const brandStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#2E7D32",
  padding: "8px 12px 20px",
  letterSpacing: 1,
};

const linkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 8,
  color: "#374151",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 500,
};

const langToggleStyle: React.CSSProperties = {
  marginTop: "auto",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #E5E7EB",
  background: "#FAFAF8",
  color: "#374151",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
};

const mainStyle: React.CSSProperties = {
  marginLeft: 220,
  minHeight: "100vh",
  padding: "24px 32px",
  background: "#FAFAF8",
};
