import { Skeleton } from "@/components/ui/skeleton"
import { SectionHeaderSkeleton } from "@/components/skeletons"

export default function PlacementsLoading() {
  return (
    <div className="bg-surface min-h-screen">
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-blue-50 via-surface to-purple-50">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <Skeleton className="h-6 w-48 rounded-full mx-auto" />
          <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
          <Skeleton className="h-6 w-full max-w-xl mx-auto" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-48 rounded-xl" />
            <Skeleton className="h-12 w-48 rounded-xl" />
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border text-center space-y-2">
                <Skeleton className="h-12 w-24 mx-auto" />
                <Skeleton className="h-5 w-32 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            ))}
          </div>
        </section>
        <section className="mb-20">
          <SectionHeaderSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border space-y-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </section>
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-gray-50 rounded-3xl p-8 md:p-16">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-8 w-72" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="aspect-video rounded-2xl" />
          </div>
        </section>
        <section className="text-center space-y-6 mb-12">
          <Skeleton className="h-6 w-48 rounded-full mx-auto" />
          <Skeleton className="h-8 w-72 mx-auto" />
          <Skeleton className="h-5 w-96 mx-auto" />
          <Skeleton className="h-10 w-full max-w-md mx-auto rounded-xl" />
        </section>
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="bg-gray-50 py-16 px-4 text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-72 mx-auto" />
          <Skeleton className="h-5 w-80 mx-auto" />
          <div className="flex gap-4 justify-center">
            <Skeleton className="h-12 w-48 rounded-xl" />
            <Skeleton className="h-12 w-40 rounded-xl" />
          </div>
        </div>
      </section>
    </div>
  )
}
