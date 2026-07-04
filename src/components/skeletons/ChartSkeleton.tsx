import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ChartSkeletonProps {
  type?: "bar" | "line" | "pie"
  height?: string
}

export function ChartSkeleton({ type = "bar", height = "h-64" }: ChartSkeletonProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
      <div className={cn("relative flex items-end gap-2", height)}>
        {type === "bar" && (
          <div className="flex items-end gap-3 w-full h-full pb-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t-lg"
                style={{ height: `${30 + Math.random() * 70}%` }}
              />
            ))}
          </div>
        )}
        {type === "line" && (
          <div className="w-full h-full relative">
            <svg className="w-full h-full" viewBox="0 0 300 150" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-200"
                points="0,120 30,100 60,110 90,80 120,90 150,60 180,70 210,40 240,50 270,30 300,45"
              />
            </svg>
          </div>
        )}
        {type === "pie" && (
          <div className="flex items-center justify-center w-full h-full gap-8">
            <Skeleton className="h-40 w-40 rounded-full" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-10" />
        ))}
      </div>
    </div>
  )
}
