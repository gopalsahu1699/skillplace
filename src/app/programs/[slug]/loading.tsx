import { Skeleton } from "@/components/ui/skeleton"
import { SectionHeaderSkeleton } from "@/components/skeletons"

export default function ProgramDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-700 py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-5 w-32 rounded-full mb-6 bg-white/20" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <Skeleton className="h-12 w-full max-w-lg bg-white/20" />
              <Skeleton className="h-6 w-full max-w-xl bg-white/20" />
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-14 w-44 rounded-xl bg-white/20" />
                <Skeleton className="h-14 w-44 rounded-xl bg-white/20" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl bg-white/10" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 max-w-7xl mx-auto px-4">
        <SectionHeaderSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-8 rounded-xl border space-y-4">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </section>
      <section className="py-16 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeaderSkeleton />
          <div className="space-y-4 mt-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border">
                <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-5 w-5" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white p-8 md:p-12 rounded-2xl border space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-12 rounded-2xl space-y-6">
            <Skeleton className="h-8 w-48 bg-white/20" />
            <Skeleton className="h-20 w-full bg-white/20" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-full bg-white/20" />
                  <Skeleton className="h-4 w-40 bg-white/20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-primary-container text-center px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-10 w-72 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
          <Skeleton className="h-14 w-44 rounded-xl mx-auto" />
        </div>
      </section>
    </div>
  )
}
