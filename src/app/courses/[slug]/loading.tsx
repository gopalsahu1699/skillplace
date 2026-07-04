import { Skeleton } from "@/components/ui/skeleton"

export default function CourseDetailLoading() {
  return (
    <div className="bg-background min-h-screen">
      <section className="relative bg-gray-800 text-white py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-3 w-12 bg-white/20" />
            <Skeleton className="h-3 w-3 bg-white/20" />
            <Skeleton className="h-3 w-16 bg-white/20" />
            <Skeleton className="h-3 w-3 bg-white/20" />
            <Skeleton className="h-3 w-24 bg-white/20" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Skeleton className="h-5 w-32 rounded-full bg-white/20" />
              <Skeleton className="h-12 w-full max-w-lg bg-white/20" />
              <Skeleton className="h-6 w-full max-w-md bg-white/20" />
              <div className="grid grid-cols-3 gap-4 p-6 bg-white/5 rounded-xl">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-16 bg-white/20" />
                    <Skeleton className="h-6 w-20 bg-white/20" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6">
                <Skeleton className="h-10 w-32 bg-white/20" />
                <Skeleton className="h-14 w-40 rounded-lg bg-white/20" />
              </div>
            </div>
            <Skeleton className="aspect-video rounded-2xl bg-white/10" />
          </div>
        </div>
      </section>
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white p-8 md:p-10 rounded-2xl border space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-3 rounded-sm" />
                  <Skeleton className="h-4 w-36" />
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-5 bg-gray-800 p-8 md:p-10 rounded-2xl space-y-6">
            <Skeleton className="h-12 w-12 rounded-lg bg-white/20" />
            <Skeleton className="h-6 w-40 bg-white/20" />
            <Skeleton className="h-8 w-full bg-white/20" />
            <div className="space-y-4 pt-4 border-t border-white/10">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 bg-white/20" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32 bg-white/20" />
                    <Skeleton className="h-3 w-24 bg-white/20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-5 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-8 rounded-xl border space-y-4">
                <Skeleton className="h-14 w-14 rounded-lg" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/3 space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 border rounded-xl flex gap-4">
                <Skeleton className="h-8 w-8 shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-8 mx-auto" />
          <div className="max-w-3xl mx-auto space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-gray-800 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-10 w-72 mx-auto bg-white/20" />
          <Skeleton className="h-6 w-96 mx-auto bg-white/20" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-14 w-48 rounded-lg bg-white/20" />
            <Skeleton className="h-14 w-40 rounded-lg bg-white/20" />
          </div>
        </div>
      </section>
    </div>
  )
}
