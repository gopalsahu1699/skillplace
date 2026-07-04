import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface SidebarSkeletonProps {
  items?: number
  className?: string
}

export function SidebarSkeleton({ items = 6, className }: SidebarSkeletonProps) {
  return (
    <div className={cn("w-64 bg-white border-r border-border p-4 space-y-2", className)}>
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
          <Skeleton className="h-5 w-5" />
          <Skeleton className={cn("h-4", i < 3 ? "w-28" : "w-20")} />
        </div>
      ))}
      <div className="pt-4 mt-4 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

export function LessonSidebarSkeleton() {
  return (
    <div className="bg-white border-r border-border h-full p-4 space-y-1">
      <div className="mb-4 pb-3 border-b border-border">
        <Skeleton className="h-5 w-40 mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
          <Skeleton className="h-4 w-4" />
          <div className="flex-1">
            <Skeleton className={cn("h-3", i < 3 ? "w-36" : "w-28")} />
            <Skeleton className="h-2 w-12 mt-1" />
          </div>
          {i % 3 === 0 && <Skeleton className="h-4 w-4 rounded-full" />}
        </div>
      ))}
    </div>
  )
}
