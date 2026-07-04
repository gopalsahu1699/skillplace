import { TableSkeleton } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminCoursesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="relative max-w-md">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <TableSkeleton rows={8} columns={6} />
    </div>
  )
}
