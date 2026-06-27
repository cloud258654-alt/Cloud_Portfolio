import type { ReactNode } from "react";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import AppShell from "./AppShell";

export const metadata = {
  title: "AI Knowledge Transfer System",
  description: "Enterprise AI Platform — 企業 AI 知識轉移系統",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AppShell>{children}</AppShell>
    </LanguageProvider>
  );
}
