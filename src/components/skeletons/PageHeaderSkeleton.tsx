import { Skeleton } from "@/components/ui/skeleton"

export function PageHeaderSkeleton({ hasBreadcrumb = true }: { hasBreadcrumb?: boolean }) {
  return (
    <div className="bg-white border-b border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {hasBreadcrumb && (
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-16" />
          </div>
        )}
        <Skeleton className="h-9 w-96" />
        <Skeleton className="h-5 w-80" />
      </div>
    </div>
  )
}

export function SectionHeaderSkeleton() {
  return (
    <div className="text-center mb-12 space-y-3">
      <Skeleton className="h-5 w-32 mx-auto" />
      <Skeleton className="h-8 w-96 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
    </div>
  )
}
