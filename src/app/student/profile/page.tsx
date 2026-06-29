'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { User, Mail, Phone, MapPin, Calendar, Camera, Save, Loader2, BookOpen, ChevronRight, Clock, CheckCircle } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true)
  const [formData, setFormData] = useState({
    full_name: '',
    phoneCode: '+91',
    phoneNumber: '',
    date_of_birth: '',
    gender: '',
    location: '',
    date_of_joining: '',
    bio: '',
  })

  useEffect(() => {
    fetchProfile()
    fetchEnrollments()
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
      // Parse phone: extract country code if present
      let phoneCode = '+91'
      let phoneNumber = data.phone || ''
      if (phoneNumber) {
        const match = phoneNumber.match(/^\+(\d{1,4})/)
        if (match) {
          phoneCode = `+${match[1]}`
          phoneNumber = phoneNumber.slice(match[0].length)
        }
      }
      setFormData({
        full_name: data.full_name || '',
        phoneCode,
        phoneNumber,
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || '',
        location: data.location || '',
        date_of_joining: data.date_of_joining || '',
        bio: data.bio || '',
      })
    }
    setLoading(false)
  }

  async function fetchEnrollments() {
    setEnrollmentsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setEnrollmentsLoading(false)
        return
      }

      const { data } = await supabase
        .from('enrollments')
        .select('*, training_programs(name, slug, duration_weeks, program_type)')
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false })

      setEnrollments(data || [])
    } catch {
      // Enrollment fetch failed
    }
    setEnrollmentsLoading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    setSuccess(false)

    const fullPhone = formData.phoneNumber
      ? `${formData.phoneCode}${formData.phoneNumber.replace(/[\s\-()]/g, '')}`
      : null

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: fullPhone,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        location: formData.location || null,
        date_of_joining: formData.date_of_joining || null,
        bio: formData.bio || null,
      })
      .eq('id', profile.id)

    setSaving(false)

    if (!error) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      fetchProfile()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-500">Loading profile...</span>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Profile not found. Please contact support.</p>
      </div>
    )
  }

  // Profile completion calculation (8 editable fields)
  const completionFields = [
    { key: 'full_name', label: 'Full Name', value: formData.full_name },
    { key: 'phone', label: 'Phone', value: formData.phoneNumber ? `${formData.phoneCode} ${formData.phoneNumber}` : '' },
    { key: 'date_of_birth', label: 'Date of Birth', value: formData.date_of_birth },
    { key: 'gender', label: 'Gender', value: formData.gender },
    { key: 'location', label: 'Location', value: formData.location },
    { key: 'date_of_joining', label: 'Date of Joining', value: formData.date_of_joining },
    { key: 'program_type', label: 'Program Type', value: profile?.program_type || '' },
    { key: 'bio', label: 'Bio', value: formData.bio },
  ]
  const filledCount = completionFields.filter((f) => f.value && f.value.toString().trim() !== '').length
  const completionPercent = Math.round((filledCount / completionFields.length) * 100)

  function getCompletionColor(percent: number) {
    if (percent >= 80) return 'text-green-600'
    if (percent >= 50) return 'text-amber-600'
    return 'text-red-500'
  }

  function getCompletionBarColor(percent: number) {
    if (percent >= 80) return 'bg-green-500'
    if (percent >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  function getCompletionLabel(percent: number) {
    if (percent === 100) return 'Complete'
    if (percent >= 80) return 'Almost there'
    if (percent >= 50) return 'Good progress'
    if (percent > 0) return 'Getting started'
    return 'Not started'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 p-6 flex items-center gap-5">
          <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'User'}
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{profile?.full_name || 'Student'}</h2>
            <p className="text-sm text-slate-500">{profile?.email || 'N/A'}</p>
            <p className="text-xs text-slate-400 mt-1">Role: {profile?.role || 'student'}</p>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="px-6 pt-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Profile Completion</span>
              <span className={`text-sm font-bold ${getCompletionColor(completionPercent)}`}>
                {completionPercent}% — {getCompletionLabel(completionPercent)}
              </span>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getCompletionBarColor(completionPercent)}`}
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            {completionPercent < 100 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {completionFields
                  .filter((f) => !f.value || f.value.toString().trim() === '')
                  .map((f) => (
                    <span key={f.key} className="text-xs bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded-lg">
                      {f.label}
                    </span>
                  ))}
              </div>
            )}
            {completionPercent === 100 && (
              <p className="mt-2 text-xs text-green-600 font-medium">Your profile is complete!</p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <p className="text-sm text-green-700">Profile updated successfully!</p>
            </div>
          )}

          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Personal Information</h3>
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
                    placeholder="Your full name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="email" type="email" value={profile?.email || ''} disabled className="pl-10 border-slate-300 bg-slate-50" />
                </div>
              </div>
              <div>
                <Label htmlFor="phone" className="text-slate-700">Phone</Label>
                <div className="flex gap-2 mt-1.5">
                  <select
                    value={formData.phoneCode}
                    onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
                    className="w-[120px] shrink-0 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+971">+971 (UAE)</option>
                    <option value="+65">+65 (SG)</option>
                    <option value="+86">+86 (CN)</option>
                    <option value="+81">+81 (JP)</option>
                    <option value="+82">+82 (KR)</option>
                    <option value="+49">+49 (DE)</option>
                    <option value="+33">+33 (FR)</option>
                    <option value="+966">+966 (SA)</option>
                    <option value="+974">+974 (QA)</option>
                    <option value="+973">+973 (BH)</option>
                    <option value="+968">+968 (OM)</option>
                    <option value="+965">+965 (KW)</option>
                  </select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="pl-10 border-slate-300"
                      placeholder="98765 43210"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="dob" className="text-slate-700">Date of Birth</Label>
                <div className="relative mt-1.5">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="dob"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="pl-10 border-slate-300"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="gender" className="text-slate-700">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: string | null) => setFormData({ ...formData, gender: value || '' })}
                >
                  <SelectTrigger id="gender" className="mt-1.5 border-slate-300">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location" className="text-slate-700">Location (City / State)</Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="pl-10 border-slate-300"
                    placeholder="e.g. Bilaspur, Chhattisgarh"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="doj" className="text-slate-700">Date of Joining</Label>
                <div className="relative mt-1.5">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="doj"
                    type="date"
                    value={formData.date_of_joining}
                    onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                    className="pl-10 border-slate-300"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="program_type" className="text-slate-700">Program Type</Label>
                <div className="relative mt-1.5">
                  <Select
                    value={profile?.program_type ?? ''}
                    onValueChange={async (value) => {
                      await supabase
                        .from('profiles')
                        .update({ program_type: value || null })
                        .eq('id', profile.id)
                      setProfile({ ...profile, program_type: value })
                    }}
                  >
                    <SelectTrigger id="program_type" className="border-slate-300">
                      <SelectValue placeholder="Select program type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online Course</SelectItem>
                      <SelectItem value="offline">Offline Course</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Online + Offline)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio" className="text-slate-700">Bio / About Me</Label>
            <div className="relative mt-1.5">
              <Camera className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="pl-10 border-slate-300 min-h-[100px]"
                placeholder="Tell us about yourself, your goals, and what you hope to achieve..."
                rows={4}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Brief description for your profile. Max 500 characters.</p>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200">
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* My Purchased Programs */}
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl shadow-sm overflow-hidden mt-6">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Purchased Programs</h2>
              <p className="text-xs text-slate-500">{enrollments.length} program{enrollments.length !== 1 ? 's' : ''} enrolled</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {enrollmentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-slate-500">Loading programs...</span>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-3">No programs purchased yet.</p>
              <Link href="/programs">
                <Button variant="outline" className="border-slate-300 text-sm">
                  Browse Programs
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enrollment) => {
                const program = enrollment.training_programs
                const isActive = enrollment.status === 'active'
                const isCompleted = enrollment.status === 'completed'
                return (
                  <Link
                    key={enrollment.id}
                    href={`/programs/${program?.slug || ''}`}
                    className="block border border-slate-200 rounded-xl p-4 hover:bg-slate-50 hover:border-blue-200 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                        <span className="text-sm font-bold text-blue-600">
                          {program?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {program?.name || 'Unknown Program'}
                          </p>
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-700 border-0 text-xs shrink-0">
                              <CheckCircle className="h-3 w-3 mr-0.5" />
                              Completed
                            </Badge>
                          )}
                          {isActive && (
                            <Badge className="bg-blue-100 text-blue-700 border-0 text-xs shrink-0">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {program?.duration_weeks && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {program.duration_weeks} weeks
                            </span>
                          )}
                          {program?.program_type && (
                            <span className="capitalize">{program.program_type}</span>
                          )}
                          <span>Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
