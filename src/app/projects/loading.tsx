import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectsLoading() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 py-10 md:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <Skeleton className="h-10 w-64 mx-auto bg-white/20" />
          <Skeleton className="h-5 w-96 mx-auto bg-white/20" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border rounded-2xl overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
