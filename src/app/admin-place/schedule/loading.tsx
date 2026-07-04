import { TableSkeleton } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function ScheduleLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div key={day} className="space-y-1">
              <Skeleton className="h-4 w-8 mx-auto" />
              {[1, 2, 3, 4, 5, 6].map((cell) => (
                <Skeleton key={cell} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </div>
      <TableSkeleton rows={4} columns={5} />
    </div>
  )
}
