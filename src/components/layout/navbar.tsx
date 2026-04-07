"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Standings" },
  { href: "/dashboard", label: "Telemetry" },
  { href: "/sessions", label: "Sessions" },
  { href: "/drivers", label: "Drivers" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.10] bg-[#050508]/65 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] backdrop-blur-2xl backdrop-saturate-150 transition-[backdrop-filter] duration-300">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 font-semibold tracking-tight text-white transition-opacity duration-200 hover:opacity-90"
        >
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(255,45,45,0.65)]" />
          <span>Velocity F1</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-end md:flex" aria-label="Main">
          <div className="velocity-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
          {links.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-zinc-400 transition-all duration-200 ease-out hover:bg-white/[0.08] hover:text-white",
                  active &&
                    "border border-white/[0.10] bg-white/[0.10] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          </div>
        </nav>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              aria-label="Open menu"
              className="inline-flex size-9 items-center justify-center rounded-lg text-zinc-200 outline-none transition-colors duration-200 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="border-white/10 bg-[#12121A]">
              <SheetHeader>
                <SheetTitle className="text-left text-white">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "rounded-xl px-3 py-3 text-sm font-medium text-zinc-300 transition-colors duration-200 hover:bg-white/[0.08] hover:text-white",
                      (l.href === "/"
                        ? pathname === "/"
                        : pathname === l.href ||
                          pathname.startsWith(`${l.href}/`)) &&
                        "border border-white/10 bg-white/[0.08] text-white",
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  href="/dashboard"
                  className="mt-4 rounded-xl border border-white/10 bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_rgba(255,45,45,0.25)] transition-opacity duration-200 hover:opacity-90"
                >
                  Open telemetry
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
