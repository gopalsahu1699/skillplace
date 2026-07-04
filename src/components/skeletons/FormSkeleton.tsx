import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface FormFieldSkeletonProps {
  labelWidth?: string
  inputHeight?: string
}

export function FormFieldSkeleton({ labelWidth = "w-24", inputHeight = "h-10" }: FormFieldSkeletonProps) {
  return (
    <div className="space-y-2">
      <Skeleton className={cn("h-4", labelWidth)} />
      <Skeleton className={cn("w-full rounded-lg", inputHeight)} />
    </div>
  )
}

export function FormSkeleton({ fields = 4, showTextarea = false, showUpload = false }: { fields?: number; showTextarea?: boolean; showUpload?: boolean }) {
  return (
    <div className="bg-white border border-border rounded-xl p-6 md:p-8 space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className={cn("grid gap-6", fields > 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
        {Array.from({ length: fields }).map((_, i) => (
          <FormFieldSkeleton key={i} labelWidth={i % 2 === 0 ? "w-20" : "w-28"} />
        ))}
      </div>
      {showTextarea && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="w-full h-32 rounded-lg" />
        </div>
      )}
      {showUpload && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="w-full h-40 rounded-lg border-2 border-dashed" />
        </div>
      )}
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-12 w-36 rounded-lg" />
        <Skeleton className="h-12 w-28 rounded-lg" />
      </div>
    </div>
  )
}
