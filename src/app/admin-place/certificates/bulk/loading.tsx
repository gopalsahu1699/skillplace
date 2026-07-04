import { FormSkeleton } from "@/components/skeletons"
import { TableSkeleton } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function BulkCertificatesLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <FormSkeleton fields={4} showUpload showTextarea />
      <div className="mt-8">
        <Skeleton className="h-6 w-48 mb-4" />
        <TableSkeleton rows={4} columns={5} />
      </div>
    </div>
  )
}
