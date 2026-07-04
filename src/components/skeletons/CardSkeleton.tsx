import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface CardSkeletonProps {
  className?: string
  imageHeight?: string
  children?: React.ReactNode
}

export function CardSkeleton({ className, imageHeight = "h-48", children }: CardSkeletonProps) {
  return (
    <div className={cn("bg-white border border-border rounded-xl overflow-hidden", className)}>
      {children ? children : (
        <>
          <Skeleton className={cn("w-full rounded-none", imageHeight)} />
          <div className="p-5 space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl p-5 space-y-2">
      <Skeleton className="h-4 w-24" />
      <div className="flex items-end justify-between">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-3 w-32" />
    </div>
  )
}
