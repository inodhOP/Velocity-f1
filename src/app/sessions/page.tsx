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

export default function SessionsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
      <Card className="border-white/[0.06] bg-card/80 ring-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-xl">Sessions</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Race and sprint sessions are loaded from OpenF1 on the dashboard. Pick a
            round, then drill into laps and car data in real time.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            href="/dashboard"
            className={cn(buttonVariants(), "no-underline")}
          >
            Go to dashboard
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
