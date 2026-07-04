import { Skeleton } from "@/components/ui/skeleton"
import { TableSkeleton } from "@/components/skeletons"

export default function CourseTestsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <TableSkeleton rows={6} columns={5} />
    </div>
  )
}
