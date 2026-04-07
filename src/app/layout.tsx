import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { GlassRippleProvider } from "@/components/ui/glass-ripple-provider";
import { VelocityCursorFx } from "@/components/ui/velocity-cursor-fx";
import { OpenF1SharedProvider } from "@/components/openf1/openf1-shared-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Velocity F1 — Live Standings",
  description:
    "Formula 1 driver and constructor championship standings, plus telemetry analytics powered by OpenF1.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0B0F] text-zinc-100">
        <OpenF1SharedProvider>
          <GlassRippleProvider>
            <VelocityCursorFx />
            <Navbar />
            <div className="flex min-h-0 flex-1 flex-col pt-14">
              <div className="flex flex-1 flex-col">{children}</div>
              <SiteFooter />
            </div>
          </GlassRippleProvider>
        </OpenF1SharedProvider>
      </body>
    </html>
  );
}
