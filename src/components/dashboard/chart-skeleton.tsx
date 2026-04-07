import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="h-[280px] w-full rounded-lg bg-white/[0.06]" />
    </div>
  );
}
