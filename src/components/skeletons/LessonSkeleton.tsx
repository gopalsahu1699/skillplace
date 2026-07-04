import { Skeleton } from "@/components/ui/skeleton"
import { VideoSkeleton } from "./VideoSkeleton"
import { LessonSidebarSkeleton } from "./SidebarSkeleton"

export function LessonContentSkeleton() {
  return (
    <div className="flex h-full">
      <div className="hidden lg:block w-80 shrink-0">
        <LessonSidebarSkeleton />
      </div>
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <VideoSkeleton />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2 p-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3 pt-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
