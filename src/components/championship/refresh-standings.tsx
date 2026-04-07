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
      data-velocity-ripple
      className="group/sync h-9 gap-2 border-white/20 bg-white/[0.04] text-zinc-100 backdrop-blur-md transition-[transform,background-color] duration-200 ease-out hover:scale-[1.02] hover:bg-white/[0.1] active:scale-[0.98] disabled:hover:scale-100"
    >
      <RefreshCw
        className={`size-3.5 transition-transform duration-200 ease-out ${pending ? "animate-spin" : "group-hover/sync:rotate-[-14deg]"}`}
      />
      {pending ? "Syncing…" : "Sync standings"}
    </Button>
  );
}
