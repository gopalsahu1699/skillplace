import { Skeleton } from "@/components/ui/skeleton"

export default function TestLoading() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-5 w-80 mx-auto" />
          <div className="flex items-center justify-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-8 space-y-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-4 pb-6 border-b last:border-b-0">
              <div className="flex items-start gap-3">
                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <div className="space-y-2 pl-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-8">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
