import { Skeleton } from "@/components/ui/skeleton"

export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Skeleton className="h-8 w-32" />
          <div className="hidden md:flex items-center gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg md:hidden" />
        </div>
      </div>
    </header>
  )
}
