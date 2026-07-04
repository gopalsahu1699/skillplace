import { Skeleton } from "@/components/ui/skeleton"

export function FooterSkeleton() {
  return (
    <footer className="bg-primary-container text-white">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="space-y-4">
              <Skeleton className="h-5 w-28 bg-white/10" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-full max-w-[160px] bg-white/10" />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Skeleton className="h-4 w-64 bg-white/10" />
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full bg-white/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
