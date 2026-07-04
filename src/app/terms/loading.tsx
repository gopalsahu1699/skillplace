import { Skeleton } from "@/components/ui/skeleton"

export default function TermsLoading() {
  return (
    <div className="bg-slate-50 min-h-screen py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <Skeleton className="h-6 w-24 rounded-full mx-auto" />
          <Skeleton className="h-10 w-72 mx-auto" />
          <Skeleton className="h-4 w-40 mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 bg-white p-6 rounded-2xl border space-y-4">
              <Skeleton className="h-4 w-24" />
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-3 w-32" />
              ))}
            </div>
          </aside>
          <main className="lg:col-span-3 bg-white p-8 md:p-12 rounded-3xl border space-y-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-72" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </main>
        </div>
      </div>
    </div>
  )
}
