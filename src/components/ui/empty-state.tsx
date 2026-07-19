'use client'

import { cn } from '@/lib/utils'
import { PackageOpen, SearchX, BookOpen, Video, Bell, FileQuestion, Database, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  courses: BookOpen,
  videos: Video,
  notifications: Bell,
  results: SearchX,
  data: Database,
  default: PackageOpen,
}

interface EmptyStateProps {
  type?: keyof typeof icons
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  icon?: LucideIcon
  className?: string
}

export function EmptyState({
  type = 'default',
  title,
  description,
  action,
  icon: CustomIcon,
  className,
}: EmptyStateProps) {
  const Icon = CustomIcon ?? icons[type] ?? icons.default

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
        <Icon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button variant="default" className="rounded-xl">
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button variant="default" className="rounded-xl" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  )
}

export function NoCoursesFound(props?: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      type="courses"
      title="No Courses Found"
      description="We couldn't find any courses matching your criteria."
      {...props}
    />
  )
}

export function NoVideosAvailable(props?: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      type="videos"
      title="No Videos Available"
      description="There are no videos in this lesson yet."
      {...props}
    />
  )
}

export function NoNotifications(props?: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      type="notifications"
      title="No Notifications"
      description="You're all caught up! No new notifications."
      {...props}
    />
  )
}

export function NoResults(props?: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      type="results"
      title="No Results"
      description="We couldn't find any results matching your search."
      {...props}
    />
  )
}

export function NoDataAvailable(props?: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      type="data"
      title="No Data Available"
      description="There is no data to display at this time."
      {...props}
    />
  )
}
