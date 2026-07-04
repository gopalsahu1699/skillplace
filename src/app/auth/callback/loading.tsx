import { Skeleton } from "@/components/ui/skeleton"

export default function AuthCallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <Skeleton className="h-4 w-40 mx-auto" />
      </div>
    </div>
  )
}
