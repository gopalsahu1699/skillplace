'use client'

import { Badge } from '@/components/ui/badge'
import { Bell, Info, AlertTriangle, CheckCircle, User, Trash2 } from 'lucide-react'
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
      return { icon: CheckCircle, color: 'bg-green-100 text-green-600', label: 'Success' }
    default:
      return { icon: Bell, color: 'bg-slate-100 text-slate-600', label: 'General' }
  }
}

interface NotificationCardProps {
  id: string
  type: string
  title: string
  message: string | null
  is_read: boolean
  created_at: string
  profiles?: { full_name: string } | null
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}

export default function NotificationCard({
  id,
  type,
  title,
  message,
  is_read,
  created_at,
  profiles,
  onMarkRead,
  onDelete,
}: NotificationCardProps) {
  const typeConfig = getTypeConfig(type)
  const TypeIcon = typeConfig.icon

  return (
    <div
      className={`border rounded-xl p-4 transition-colors ${
        is_read
          ? 'border-slate-200 bg-white hover:bg-slate-50'
          : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${typeConfig.color}`}>
          <TypeIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-slate-900">{title}</p>
            {!is_read && (
              <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">New</Badge>
            )}
            <Badge className={`border-0 text-xs ${typeConfig.color}`}>
              {typeConfig.label}
            </Badge>
          </div>
          {message && (
            <p className="text-sm text-slate-600 mb-2">{message}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {profiles?.full_name && (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" /> {profiles.full_name}
              </span>
            )}
            <span>{new Date(created_at).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!is_read && (
            <button
              type="button"
              onClick={() => onMarkRead(id)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-green-50 hover:text-green-600"
              title="Mark as read"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
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
