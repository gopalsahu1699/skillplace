import { TableSkeleton } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function StudentsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <TableSkeleton rows={8} columns={6} />
    </div>
  )
}
