import { Skeleton } from "@/components/ui/skeleton"
import { StatCardSkeleton } from "./CardSkeleton"

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-xl p-5 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
        <div className="bg-white border border-border rounded-xl p-5 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function StudentDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-xl p-5 space-y-3">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 3 }).map((_, j) => (
            <Skeleton key={j} className="h-16 w-full rounded-lg" />
          ))}
        </div>
        <div className="bg-white border border-border rounded-xl p-5 space-y-3">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="flex items-center gap-3 p-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
