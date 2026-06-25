import type { ReactNode } from "react";

export const metadata = {
  title: "AI Knowledge Transfer System",
  description: "Enterprise AI Platform"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
