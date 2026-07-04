import { TableSkeleton } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function PaymentsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border rounded-xl p-5 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <TableSkeleton rows={8} columns={6} />
    </div>
  )
}
