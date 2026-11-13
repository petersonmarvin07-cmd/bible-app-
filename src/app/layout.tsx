import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumen — Scripture for every age",
  description:
    "Lumen is the all-ages Bible app: one passage retold for four hearts, a household wonder wall, faithprint matching, and a memory verse forge.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-parchment text-ink antialiased">{children}</body>
    </html>
  );
}
