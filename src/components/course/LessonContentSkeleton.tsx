'use client'

export default function LessonContentSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="bg-slate-200 rounded-2xl aspect-video mb-6" />
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="h-4 bg-slate-200 rounded w-5/6" />
      </div>
    </div>
  )
}
