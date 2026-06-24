'use client'
import { useState, useEffect, useCallback } from 'react'
import { StickyNote, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { UserNote } from '@/types'

interface StudentNotesProps {
  lessonId: string
  className?: string
}

export default function StudentNotes({ lessonId, className }: StudentNotesProps) {
  const [note, setNote] = useState<UserNote | null>(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchNote = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('user_notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single()

    if (data) {
      setNote(data)
      setContent(data.content)
    }
    setLoading(false)
  }, [lessonId])

  useEffect(() => {
    fetchNote()
  }, [fetchNote])

  const saveNote = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setSaving(true)

    if (note) {
      await supabase
        .from('user_notes')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', note.id)
    } else {
      const { data } = await supabase
        .from('user_notes')
        .insert({ user_id: user.id, lesson_id: lessonId, content })
        .select()
        .single()

      if (data) setNote(data)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [note, content, lessonId])

  // Auto-save on content change (debounced)
  useEffect(() => {
    if (!note || content === note.content) return

    const timeout = setTimeout(() => {
      saveNote()
    }, 2000)

    return () => clearTimeout(timeout)
  }, [content, note, saveNote])

  if (loading) {
    return (
      <div className={cn('bg-white border border-slate-200 rounded-2xl p-4', className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-100 rounded w-1/3"></div>
          <div className="h-20 bg-slate-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white border border-slate-200 rounded-2xl p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-slate-500" />
          <h4 className="text-sm font-semibold text-slate-900">My Notes</h4>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <Save className="h-3 w-3" />
              Saved
            </span>
          )}
          {saving && (
            <span className="text-xs text-slate-400">Saving...</span>
          )}
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Take notes for this lesson..."
        className="w-full min-h-[120px] border border-slate-200 rounded-xl p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
      />
    </div>
  )
}
