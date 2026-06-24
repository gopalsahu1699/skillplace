'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { User } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
      })
    }
    setLoading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    await supabase
      .from('profiles')
      .update(formData)
      .eq('id', profile.id)

    setSaving(false)
    fetchProfile()
  }

  if (loading) {
    return <p className="text-slate-500">Loading profile...</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-2xl shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-slate-100">
          <div className="h-20 w-20 bg-blue-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">
              {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || '?'}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{profile?.full_name || 'Student'}</h2>
            <p className="text-sm text-slate-500">{profile?.email || 'N/A'}</p>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="fullName" className="text-slate-700">Full Name</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="fullName"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="pl-10 border-slate-300"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input id="email" type="email" value={profile?.email || ''} disabled className="mt-1.5 border-slate-300 bg-slate-50" />
            </div>
            <div>
              <Label htmlFor="phone" className="text-slate-700">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1.5 border-slate-300"
              />
            </div>
          </div>
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  )
}
