import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Google Flow Director OS",
  description:
    "A production operating system for planning, prompting, and managing Google Flow videos.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#F8F7F3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
