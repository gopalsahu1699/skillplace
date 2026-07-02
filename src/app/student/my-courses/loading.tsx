import { Skeleton } from '@/components/ui/skeleton'

export default function MyCoursesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-44" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-border rounded-xl overflow-hidden">
            <Skeleton className="h-36 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
