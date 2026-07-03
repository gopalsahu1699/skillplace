'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Search,
  ChevronDown,
} from 'lucide-react'

interface ForensicStats {
  totalSamples: number
  flaggedSamples: number
  openReports: number
  samplesLast24h: number
}

interface ForensicSample {
  id: string
  user_id: string
  lesson_id: string
  sample_timestamp: string
  video_current_time: number
  screenshot_b64: string
  user_agent: string
  screen_width: number
  screen_height: number
  ip_address: string
  flagged: boolean
  flag_reason: string
  warning_sent_at: string | null
  access_revoked_at: string | null
  created_at: string
  profiles: { full_name: string; email: string }
}

interface LeakReport {
  id: string
  user_id: string
  lesson_id: string
  course_id: string
  status: string
  severity: string
  detected_by: string
  warning_sent_at: string | null
  access_revoked_at: string | null
  created_at: string
  profiles: { full_name: string; email: string }
  lessons: { title: string }
}

export default function ForensicPage() {
  const [stats, setStats] = useState<ForensicStats | null>(null)
  const [samples, setSamples] = useState<ForensicSample[]>([])
  const [reports, setReports] = useState<LeakReport[]>([])
  const [tab, setTab] = useState<'stats' | 'samples' | 'reports'>('stats')
  const [loading, setLoading] = useState(true)
  const [searchUser, setSearchUser] = useState('')
  const [selectedSample, setSelectedSample] = useState<ForensicSample | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, samplesRes, reportsRes] = await Promise.all([
        fetch('/api/admin/forensic?type=stats'),
        fetch('/api/admin/forensic?type=samples&limit=50'),
        fetch('/api/admin/forensic?type=reports&limit=50'),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (samplesRes.ok) {
        const s = await samplesRes.json()
        setSamples(s.data || [])
      }
      if (reportsRes.ok) {
        const r = await reportsRes.json()
        setReports(r.data || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const performAction = async (action: string, payload: Record<string, unknown>) => {
    setActionLoading(action)
    try {
      const res = await fetch('/api/admin/forensic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      })
      if (res.ok) await fetchData()
    } finally {
      setActionLoading(null)
    }
  }

  const filteredSamples = searchUser
    ? samples.filter(s =>
        s.profiles?.full_name?.toLowerCase().includes(searchUser.toLowerCase()) ||
        s.profiles?.email?.toLowerCase().includes(searchUser.toLowerCase())
      )
    : samples

  const severityColor = (s: string) => {
    switch (s) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Video Security & Forensic Monitoring</h1>
          <p className="text-sm text-slate-500 mt-1">Detect and respond to unauthorized video recording and sharing</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-px">
        {(['stats', 'samples', 'reports'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'stats' ? 'Overview' : t === 'samples' ? 'Forensic Samples' : 'Leak Reports'}
            {t === 'samples' && stats && (
              <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                {stats.flaggedSamples}
              </span>
            )}
            {t === 'reports' && stats && (
              <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                {stats.openReports}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      )}

      {!loading && tab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalSamples}</p>
                <p className="text-xs text-slate-500">Total Forensic Samples</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.flaggedSamples}</p>
                <p className="text-xs text-slate-500">Flagged Samples</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 rounded-lg">
                <Eye className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.openReports}</p>
                <p className="text-xs text-slate-500">Open Leak Reports</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <ChevronDown className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.samplesLast24h}</p>
                <p className="text-xs text-slate-500">Samples (Last 24h)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && tab === 'samples' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {filteredSamples.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No forensic samples found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSamples.map(sample => (
                <div
                  key={sample.id}
                  className={`bg-white rounded-xl border p-4 ${
                    sample.flagged ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-slate-900">
                          {sample.profiles?.full_name || 'Unknown'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {sample.profiles?.email || ''}
                        </span>
                        {sample.flagged && (
                          <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-medium">
                            Flagged
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>Lesson: {sample.lesson_id?.slice(0, 8)}...</span>
                        <span>Time: {sample.video_current_time?.toFixed(1)}s</span>
                        <span>Screen: {sample.screen_width}x{sample.screen_height}</span>
                        <span>IP: {sample.ip_address || 'N/A'}</span>
                        <span>
                          {new Date(sample.created_at).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {sample.flag_reason && (
                        <p className="mt-1 text-xs text-red-600">{sample.flag_reason}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedSample(selectedSample?.id === sample.id ? null : sample)}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        {selectedSample?.id === sample.id ? 'Hide' : 'View'}
                      </button>
                      {!sample.flagged && (
                        <button
                          onClick={() => performAction('flag', { sampleId: sample.id, userId: sample.user_id })}
                          disabled={actionLoading === 'flag'}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          {actionLoading === 'flag' ? '...' : 'Flag'}
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedSample?.id === sample.id && sample.screenshot_b64 && (
                    <div className="mt-4">
                      <img
                        src={`data:image/jpeg;base64,${sample.screenshot_b64}`}
                        alt="Forensic sample"
                        className="max-w-full rounded-lg border border-slate-200"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && tab === 'reports' && (
        <div>
          {reports.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No leak reports</p>
              <p className="text-xs mt-1">All clear — no piracy incidents detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(report => (
                <div
                  key={report.id}
                  className={`bg-white rounded-xl border p-4 ${
                    report.status === 'open' ? 'border-red-200' :
                    report.status === 'investigating' ? 'border-yellow-200' :
                    report.status === 'resolved' ? 'border-green-200' :
                    'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-sm text-slate-900">
                          {report.profiles?.full_name || 'Unknown'}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium border ${severityColor(report.severity)}`}>
                          {report.severity}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          report.status === 'open' ? 'bg-red-50 text-red-700' :
                          report.status === 'investigating' ? 'bg-yellow-50 text-yellow-700' :
                          report.status === 'resolved' ? 'bg-green-50 text-green-700' :
                          'bg-slate-50 text-slate-500'
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          via {report.detected_by}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>Lesson: {report.lessons?.title || report.lesson_id?.slice(0, 8)}</span>
                        <span>Created: {new Date(report.created_at).toLocaleString('en-IN')}</span>
                        {report.warning_sent_at && (
                          <span className="text-amber-600">Warning sent</span>
                        )}
                        {report.access_revoked_at && (
                          <span className="text-red-600">Access revoked</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {report.status === 'open' && (
                        <>
                          {!report.warning_sent_at && (
                            <button
                              onClick={() => performAction('warn', {
                                userId: report.user_id,
                                lessonId: report.lesson_id,
                                reportId: report.id,
                              })}
                              disabled={actionLoading === 'warn'}
                              className="px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                            >
                              {actionLoading === 'warn' ? '...' : 'Send Warning'}
                            </button>
                          )}
                          {!report.access_revoked_at && (
                            <button
                              onClick={() => {
                                if (confirm('Revoke student access to this course? This cannot be undone.')) {
                                  performAction('revoke', {
                                    userId: report.user_id,
                                    courseId: report.course_id,
                                    reportId: report.id,
                                  })
                                }
                              }}
                              disabled={actionLoading === 'revoke'}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              {actionLoading === 'revoke' ? '...' : 'Revoke Access'}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const notes = prompt('Resolution notes:')
                              performAction('resolve', { reportId: report.id, notes })
                            }}
                            disabled={actionLoading === 'resolve'}
                            className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Dismissal reason:')
                              performAction('dismiss', { reportId: report.id, notes })
                            }}
                            disabled={actionLoading === 'dismiss'}
                            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                      {report.status === 'resolved' && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Resolved
                        </span>
                      )}
                      {report.status === 'dismissed' && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Dismissed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
