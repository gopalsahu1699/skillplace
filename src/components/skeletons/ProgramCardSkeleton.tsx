import { Skeleton } from "@/components/ui/skeleton"

export function ProgramCardSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="space-y-2 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-2 w-2 rounded-sm shrink-0" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-lg mt-4" />
      </div>
    </div>
  )
}

export function ProgramGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProgramCardSkeleton key={i} />
      ))}
    </div>
  )
}
