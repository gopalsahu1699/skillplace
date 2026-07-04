import { Skeleton } from "@/components/ui/skeleton"

export function HeroSkeleton() {
  return (
    <section className="relative bg-primary-container min-h-[500px] lg:min-h-[600px] flex items-center overflow-hidden">
      <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-12 w-full max-w-lg" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-5 w-full max-w-md" />
            <Skeleton className="h-5 w-2/3" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-14 w-40 rounded-xl" />
              <Skeleton className="h-14 w-40 rounded-xl" />
            </div>
            <div className="flex gap-6 pt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="aspect-square rounded-3xl overflow-hidden">
              <Skeleton className="w-full h-full rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
