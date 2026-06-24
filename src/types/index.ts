export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'student' | 'admin' | 'employee'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  order_index: number
  is_active: boolean
  created_at: string
}

export interface Course {
  id: string
  category_id: string | null
  title: string
  slug: string
  description: string | null
  short_description: string | null
  thumbnail_url: string | null
  preview_video_url: string | null
  price: number
  discount_price: number | null
  duration_hours: number | null
  level: 'beginner' | 'intermediate' | 'advanced'
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category
  modules?: Module[]
}

export interface Module {
  id: string
  course_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  order_index: number
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  description: string | null
  content_type: 'video' | 'pdf' | 'quiz' | 'text'
  video_url: string | null
  video_duration: number | null
  pdf_url: string | null
  text_content: string | null
  duration_minutes: number | null
  is_downloadable: boolean
  order_index: number
  is_free: boolean
}

export interface Test {
  id: string
  course_id: string
  lesson_id: string | null
  title: string
  description: string | null
  duration_minutes: number | null
  passing_score: number
  max_attempts: number
  time_limit_minutes: number | null
  is_active: boolean
}

export interface TestQuestion {
  id: string
  test_id: string
  question: string
  question_type: 'mcq' | 'true_false' | 'short_answer'
  options: string[] | null
  correct_answer: string
  explanation: string | null
  points: number
  order_index: number
}

export interface TestAttempt {
  id: string
  user_id: string
  test_id: string
  answers: Record<string, string> | null
  score: number | null
  passed: boolean
  started_at: string
  completed_at: string | null
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  status: 'active' | 'completed' | 'expired'
  progress_percent: number
  enrolled_at: string
  completed_at: string | null
  course?: Course
}

export interface CourseProgress {
  id: string
  user_id: string
  course_id: string
  lesson_id: string
  completed: boolean
  completed_at: string | null
}

export interface UserNote {
  id: string
  user_id: string
  lesson_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  certificate_number: string
  issued_at: string
  pdf_url: string | null
  course?: Course
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string | null
  type: string
  is_read: boolean
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  source: string
  status: 'new' | 'contacted' | 'converted' | 'closed'
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  course_id: string
  amount: number
  currency: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  razorpay_signature: string | null
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
  updated_at: string
}

export interface StudentProject {
  id: string
  user_id: string
  course_id: string
  title: string
  description: string | null
  image_url: string | null
  project_url: string | null
  is_approved: boolean
  created_at: string
}

export interface Testimonial {
  id: string
  student_name: string
  student_photo: string | null
  course_name: string | null
  rating: number
  review: string
  is_featured: boolean
  is_active: boolean
  created_at: string
}
