import { adminSupabase } from './admin'

export async function getCategories() {
  const { data, error } = await adminSupabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  return data || []
}

export async function getCourses(categoryId?: string) {
  let query = adminSupabase
    .from('courses')
    .select('*, categories(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching courses:', error)
    return []
  }
  return data || []
}

export async function getCourseBySlug(slug: string) {
  const { data, error } = await adminSupabase
    .from('courses')
    .select('*, categories(*)')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching course:', JSON.stringify(error))
    return null
  }
  return data
}

export async function getTestimonials() {
  const { data, error } = await adminSupabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }
  return data || []
}

export async function getLeads() {
  const { data, error } = await adminSupabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
    return []
  }
  return data || []
}

export async function getStudents() {
  const { data, error } = await adminSupabase
    .from('profiles')
    .select('*, enrollments(*)')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching students:', error)
    return []
  }
  return data || []
}

export async function getPayments() {
  const { data, error } = await adminSupabase
    .from('payments')
    .select('*, profiles(*), courses(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching payments:', error)
    return []
  }
  return data || []
}

export async function getCertificates() {
  const { data, error } = await adminSupabase
    .from('certificates')
    .select('*, profiles(*), courses(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching certificates:', error)
    return []
  }
  return data || []
}

export async function getDashboardStats() {
  const [studentsRes, coursesRes, paymentsRes, leadsRes, employeesRes] = await Promise.all([
    adminSupabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    adminSupabase.from('courses').select('id', { count: 'exact', head: true }).eq('is_active', true),
    adminSupabase.from('payments').select('amount').eq('status', 'completed'),
    adminSupabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    adminSupabase.from('profiles').select('id', { count: 'exact', head: true }).in('role', ['admin', 'employee']),
  ])

  const totalStudents = studentsRes.count || 0
  const activeCourses = coursesRes.count || 0
  const totalRevenue = paymentsRes.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  const newLeads = leadsRes.count || 0
  const totalEmployees = employeesRes.count || 0

  return {
    totalStudents,
    activeCourses,
    totalRevenue,
    newLeads,
    totalEmployees,
  }
}

export async function getRecentEnrollments() {
  const { data, error } = await adminSupabase
    .from('enrollments')
    .select('*, courses(title), profiles(full_name)')
    .order('enrolled_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching recent enrollments:', error)
    return []
  }
  return data || []
}

export async function getRecentPayments() {
  const { data, error } = await adminSupabase
    .from('payments')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching recent payments:', error)
    return []
  }
  return data || []
}

export async function getStudentEnrollments(userId: string) {
  const { data, error } = await adminSupabase
    .from('enrollments')
    .select('*, courses(title, slug, thumbnail_url)')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })

  if (error) {
    console.error('Error fetching student enrollments:', error)
    return []
  }
  return data || []
}

export async function getStudentCertificates(userId: string) {
  const { data, error } = await adminSupabase
    .from('certificates')
    .select('*, courses(title)')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false })

  if (error) {
    console.error('Error fetching student certificates:', error)
    return []
  }
  return data || []
}

export async function getStudentTests(userId: string) {
  const { data, error } = await adminSupabase
    .from('tests')
    .select('*, courses(title), test_attempts(*)')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching student tests:', error)
    return []
  }
  return data || []
}

export async function getStudentNotifications(userId: string) {
  const { data, error } = await adminSupabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching student notifications:', error)
    return []
  }
  return data || []
}

export async function getApprovedProjects() {
  const { data, error } = await adminSupabase
    .from('student_projects')
    .select('*, profiles(full_name), courses(title)')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching approved projects:', error)
    return []
  }
  return data || []
}
