"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

export function RefreshStandingsButton() {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => start(() => router.refresh())}
      className="h-9 gap-2 border-white/20 bg-white/[0.04] text-zinc-100 backdrop-blur-md transition-all duration-200 hover:bg-white/[0.1]"
    >
      <RefreshCw className={`size-3.5 ${pending ? "animate-spin" : ""}`} />
      {pending ? "Syncing…" : "Sync standings"}
    </Button>
  );
}
