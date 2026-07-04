import { Skeleton } from "@/components/ui/skeleton"

export default function EnrollLoading() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-5 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white p-6 md:p-8 rounded-2xl border space-y-4">
                <Skeleton className="h-6 w-48" />
                {i === 5 ? (
                  <>
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex items-center gap-4 p-4 border rounded-xl">
                        <Skeleton className="h-5 w-5" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-5 w-5" />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-2xl border space-y-4 sticky top-24">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-px w-full" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-px w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
