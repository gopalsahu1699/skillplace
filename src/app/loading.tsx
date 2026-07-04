import { HeroSkeleton } from "@/components/skeletons"
import { SectionHeaderSkeleton } from "@/components/skeletons"
import { CourseGridSkeleton } from "@/components/skeletons"
import { ProgramGridSkeleton } from "@/components/skeletons"
import { TestimonialCardSkeleton } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomeLoading() {
  return (
    <div>
      <HeroSkeleton />
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <SectionHeaderSkeleton />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton className="h-16 w-16 rounded-2xl mx-auto" />
              <Skeleton className="h-5 w-24 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          ))}
        </div>
      </section>
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeaderSkeleton />
          <CourseGridSkeleton count={3} />
        </div>
      </section>
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeaderSkeleton />
          <ProgramGridSkeleton count={3} />
        </div>
      </section>
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeaderSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <TestimonialCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
