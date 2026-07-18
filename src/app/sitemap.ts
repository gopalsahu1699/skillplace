import type { MetadataRoute } from 'next'
import { adminSupabase } from '@/lib/supabase/admin'

const BASE_URL = 'https://www.skillplace.in'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/courses`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/programs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/placements`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/refund-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/projects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ]

  let coursePages: MetadataRoute.Sitemap = []
  try {
    const { data: courses } = await adminSupabase
      .from('courses')
      .select('slug, updated_at')
      .eq('is_active', true)

    if (courses) {
      coursePages = courses.map((course) => ({
        url: `${BASE_URL}/courses/${course.slug}`,
        lastModified: new Date(course.updated_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch { }

  let programPages: MetadataRoute.Sitemap = []
  try {
    const { data: programs } = await adminSupabase
      .from('training_programs')
      .select('slug, updated_at')
      .eq('is_active', true)

    if (programs) {
      programPages = programs.map((program) => ({
        url: `${BASE_URL}/programs/${program.slug}`,
        lastModified: new Date(program.updated_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch { }

  let branchPages: MetadataRoute.Sitemap = []
  try {
    const { data: branches } = await adminSupabase
      .from('branches')
      .select('slug')
      .eq('is_active', true)

    if (branches) {
      branchPages = branches.map((branch) => ({
        url: `${BASE_URL}/courses?branch=${branch.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    }
  } catch { }

  return [...staticPages, ...coursePages, ...programPages, ...branchPages]
}
