import { adminSupabase } from '@/lib/supabase/admin'

export interface HomepageStats {
  studentsTrained: number
  projectsBuilt: number
  hoursOfLearning: number
  industryMentors: number
  placementAssistance: number
  communityMembers: number
}

export async function getHomepageStats(): Promise<HomepageStats> {
  const [studentsRes, coursesRes, projectsRes, mentorsRes, communityRes] = await Promise.all([
    adminSupabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'student'),
    adminSupabase
      .from('courses')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    adminSupabase
      .from('course_enrollments')
      .select('id', { count: 'exact', head: true }),
    adminSupabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin'),
    adminSupabase
      .from('profiles')
      .select('id', { count: 'exact', head: true }),
  ])

  const students = studentsRes.count || 0
  const courses = coursesRes.count || 0
  const enrollments = projectsRes.count || 0
  const mentors = mentorsRes.count || 0
  const community = communityRes.count || 0

  return {
    studentsTrained: students,
    projectsBuilt: enrollments,
    hoursOfLearning: courses * 120,
    industryMentors: mentors,
    placementAssistance: 100,
    communityMembers: community,
  }
}

export interface StudentProject {
  id: string
  title: string
  description: string | null
  image_url: string | null
  student_name: string | null
  created_at: string
}

export async function getStudentProjects(): Promise<StudentProject[]> {
  const { data, error } = await adminSupabase
    .from('course_enrollments')
    .select('id, created_at, profiles(full_name), courses(title)')
    .order('created_at', { ascending: false })
    .limit(6)

  if (error || !data) return []

  return data.map((item: { id: string; created_at: string; profiles?: { full_name: string }[]; courses?: { title: string }[] }) => ({
    id: item.id,
    title: item.courses?.[0]?.title || 'Project',
    description: null,
    image_url: null,
    student_name: item.profiles?.[0]?.full_name || 'Student',
    created_at: item.created_at,
  }))
}

export interface PlacementStory {
  id: string
  student_name: string
  company: string
  role: string
  testimonial: string | null
}

export async function getPlacementStories(): Promise<PlacementStory[]> {
  const { data, error } = await adminSupabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error || !data) return []

  return data.map((t: { id: string; student_name?: string; company?: string; role?: string; review?: string | null }) => ({
    id: t.id,
    student_name: t.student_name || 'Student',
    company: t.company || 'Company',
    role: t.role || 'Engineer',
    testimonial: t.review || null,
  }))
}
