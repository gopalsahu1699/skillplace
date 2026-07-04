import { Skeleton } from "@/components/ui/skeleton"
import { FormFieldSkeleton } from "./FormSkeleton"

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="space-y-2 flex-1 text-center md:text-left">
            <Skeleton className="h-6 w-48 mx-auto md:mx-0" />
            <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
            <Skeleton className="h-4 w-56 mx-auto md:mx-0" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg shrink-0" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldSkeleton labelWidth="w-24" />
          <FormFieldSkeleton labelWidth="w-28" />
          <FormFieldSkeleton labelWidth="w-20" />
          <FormFieldSkeleton labelWidth="w-32" />
          <div className="md:col-span-2">
            <FormFieldSkeleton labelWidth="w-24" inputHeight="h-24" />
          </div>
        </div>
        <div className="flex gap-4 mt-6 pt-6 border-t border-border">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
