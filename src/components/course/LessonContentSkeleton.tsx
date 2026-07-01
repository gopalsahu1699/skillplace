'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LessonContentSkeletonProps {
  className?: string
}

export default function LessonContentSkeleton({ className }: LessonContentSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton className="w-full aspect-video rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}
