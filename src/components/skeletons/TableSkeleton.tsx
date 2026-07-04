import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface TableSkeletonProps {
  rows?: number
  columns?: number
  actionWidth?: string
}

export function TableSkeleton({ rows = 8, columns = 5, actionWidth = "w-24" }: TableSkeletonProps) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-3">
                  <Skeleton className="h-4 w-full max-w-[120px]" />
                </th>
              ))}
              <th className="p-3">
                <Skeleton className={cn("h-4", actionWidth)} />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-t border-border">
                {Array.from({ length: columns }).map((_, j) => (
                  <td key={j} className="p-3">
                    <Skeleton className={cn("h-4", j === 0 ? "w-3/4" : j === columns - 1 ? "w-1/3" : "w-1/2")} />
                  </td>
                ))}
                <td className="p-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-border flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
