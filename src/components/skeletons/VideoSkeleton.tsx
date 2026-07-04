import { Skeleton } from "@/components/ui/skeleton"

export function VideoSkeleton() {
  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden" role="status" aria-label="Video loading">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <Skeleton className="h-3 w-24 rounded" />
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <Skeleton className="h-1 w-full rounded bg-white/10" />
        <div className="flex justify-between mt-2">
          <Skeleton className="h-3 w-16 rounded bg-white/10" />
          <Skeleton className="h-3 w-16 rounded bg-white/10" />
        </div>
      </div>
      <div className="absolute top-4 right-4">
        <Skeleton className="h-8 w-8 rounded-lg bg-white/10" />
      </div>
    </div>
  )
}

export function VideoPlayerSkeleton() {
  return (
    <div className="space-y-4">
      <VideoSkeleton />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
