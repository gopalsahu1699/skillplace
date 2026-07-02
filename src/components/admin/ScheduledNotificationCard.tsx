'use client'

import { Badge } from '@/components/ui/badge'
import { Bell, Info, AlertTriangle, CheckCircle as CheckCircleIcon, Calendar, Clock, Trash2, User, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type TypeConfig = {
  icon: LucideIcon
  color: string
  label: string
}

function getTypeConfig(type: string): TypeConfig {
  switch (type) {
    case 'info':
      return { icon: Info, color: 'bg-blue-100 text-blue-600', label: 'Info' }
    case 'warning':
      return { icon: AlertTriangle, color: 'bg-amber-100 text-amber-600', label: 'Warning' }
    case 'success':
      return { icon: CheckCircleIcon, color: 'bg-green-100 text-green-600', label: 'Success' }
    default:
      return { icon: Bell, color: 'bg-slate-100 text-slate-600', label: 'General' }
  }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  sent: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-600',
}

interface ScheduledNotificationCardProps {
  id: string
  type: string
  title: string
  message: string | null
  status: string
  scheduled_at: string
  profiles?: { full_name: string } | null
  onDelete: (id: string) => void
}

export default function ScheduledNotificationCard({
  id,
  type,
  title,
  message,
  status,
  scheduled_at,
  profiles,
  onDelete,
}: ScheduledNotificationCardProps) {
  const typeConfig = getTypeConfig(type)
  const TypeIcon = typeConfig.icon

  return (
    <div
      className={`border rounded-xl p-4 transition-colors ${
        status === 'pending'
          ? 'border-amber-200 bg-amber-50/30 hover:bg-amber-50/50'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${typeConfig.color}`}>
          <TypeIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-semibold text-slate-900">{title}</p>
            <Badge className={`border-0 text-xs ${typeConfig.color}`}>
              {typeConfig.label}
            </Badge>
            <Badge className={`border-0 text-xs ${statusColors[status] || statusColors.pending}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
          {message && (
            <p className="text-sm text-slate-600 mb-2">{message}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(scheduled_at).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(scheduled_at).toLocaleTimeString()}
            </span>
            {profiles?.full_name ? (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" /> {profiles.full_name}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3 w-3" /> All Students
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onDelete(id)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
