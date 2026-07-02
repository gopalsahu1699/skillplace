import { Skeleton } from '@/components/ui/skeleton'

export default function ContactLoading() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Skeleton className="h-9 w-64 mb-2 mx-auto" />
        <Skeleton className="h-5 w-96 mb-8 mx-auto" />
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-12 w-full rounded-lg mt-4" />
        </div>
      </div>
    </div>
  )
}
