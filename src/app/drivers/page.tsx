import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DriversPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
      <Card className="border-white/[0.06] bg-card/80 ring-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-xl">Drivers</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Driver rosters are resolved per session via OpenF1. Use the dashboard to
            select two drivers and compare lap evolution, sectors, and trap speeds.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            href="/dashboard"
            className={cn(buttonVariants(), "no-underline")}
          >
            Open comparison
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
