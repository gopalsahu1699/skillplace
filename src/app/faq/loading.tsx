import { Skeleton } from "@/components/ui/skeleton"

export default function FAQLoading() {
  return (
    <div className="bg-surface min-h-screen">
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <Skeleton className="h-4 w-20 mx-auto" />
          <Skeleton className="h-10 w-96 mx-auto" />
          <Skeleton className="h-5 w-80 mx-auto" />
        </div>
      </section>
      <section className="pb-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border overflow-hidden">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="p-6 border-b last:border-b-0">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center space-y-4">
            <Skeleton className="h-5 w-56 mx-auto" />
            <Skeleton className="h-12 w-40 rounded-xl mx-auto" />
          </div>
        </div>
      </section>
    </div>
  )
}
