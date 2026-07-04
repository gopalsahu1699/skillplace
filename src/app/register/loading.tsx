import { Skeleton } from "@/components/ui/skeleton"

export default function RegisterLoading() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 p-12 xl:p-16 flex-col justify-center">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-12 w-12 rounded-xl bg-white/20" />
          <Skeleton className="h-6 w-40 bg-white/20" />
        </div>
        <Skeleton className="h-10 w-80 mb-4 bg-white/20" />
        <Skeleton className="h-6 w-64 mb-8 bg-white/20" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full bg-white/20" />
              <Skeleton className="h-4 w-44 bg-white/20" />
            </div>
          ))}
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-5 w-64 mx-auto" />
          </div>
          <div className="bg-white p-6 md:p-8 rounded-2xl border space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <Skeleton className="h-5 w-56 mx-auto" />
        </div>
      </div>
    </div>
  )
}
