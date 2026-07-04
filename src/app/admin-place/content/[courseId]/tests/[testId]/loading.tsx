import { Skeleton } from "@/components/ui/skeleton"
import { FormSkeleton } from "@/components/skeletons"

export default function TestEditorLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      <FormSkeleton fields={3} showTextarea />
      <div className="bg-white border rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center gap-2 p-3 border rounded-lg">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
