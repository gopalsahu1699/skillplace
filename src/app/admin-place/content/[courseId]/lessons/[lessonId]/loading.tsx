import { Skeleton } from "@/components/ui/skeleton"
import { FormSkeleton } from "@/components/skeletons"

export default function LessonEditorLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FormSkeleton fields={2} showTextarea />
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
