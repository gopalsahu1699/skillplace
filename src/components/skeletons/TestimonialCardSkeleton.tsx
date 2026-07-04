import { Skeleton } from "@/components/ui/skeleton"

export function TestimonialCardSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-full shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4 w-4" />
          ))}
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
