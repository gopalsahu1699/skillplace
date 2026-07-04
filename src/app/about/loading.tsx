import { Skeleton } from "@/components/ui/skeleton"
import { SectionHeaderSkeleton } from "@/components/skeletons"

export default function AboutLoading() {
  return (
    <div className="bg-background min-h-screen">
      <section className="relative h-[600px] flex items-center overflow-hidden bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <Skeleton className="h-4 w-32 mb-6" />
          <Skeleton className="h-12 w-full max-w-xl mb-6" />
          <Skeleton className="h-6 w-full max-w-lg mb-10" />
          <div className="flex gap-4">
            <Skeleton className="h-14 w-40 rounded-lg" />
            <Skeleton className="h-14 w-40 rounded-lg" />
          </div>
        </div>
      </section>
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          <div className="space-y-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </section>
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeaderSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-8 rounded-xl border space-y-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <SectionHeaderSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-4">
              <Skeleton className="h-64 w-64 rounded-2xl mx-auto" />
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
              <Skeleton className="h-4 w-40 mx-auto" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
