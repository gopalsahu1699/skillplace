import { adminSupabase } from '@/lib/supabase/admin'

const BASE_URL = 'https://skillplaceacademy.com'
const IMAGE_BASE = 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images'

const staticImages = [
  'skillplace_logo.jpg',
  'about-hero-bg.jpg',
  'programs-hero-bg.jpg',
  'course-detail-gallery.jpg',
  'course-detail-banner.jpg',
  'program-detail.jpg',
  'course-civil-engineering.jpg',
  'course-mechanical-engineering.jpg',
  'course-electronics-automation.jpg',
  'course-civil-fallback.jpg',
  'Logo for Automensor.png',
  'Himanshu.png',
]

export async function generateImageSitemap() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${staticImages.map((img) => `
  <url>
    <loc>${BASE_URL}</loc>
    <image:image>
      <image:loc>${IMAGE_BASE}/${encodeURIComponent(img)}</image:loc>
      <image:caption>Skillplace Academy - Engineering Training</image:caption>
    </image:image>
  </url>`).join('')}
  ${await getCourseImages()}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}

async function getCourseImages() {
  try {
    const { data: courses } = await adminSupabase
      .from('courses')
      .select('slug, thumbnail_url')
      .eq('is_active', true)
      .not('thumbnail_url', 'is', null)

    if (!courses || courses.length === 0) return ''

    return courses.map((course: { slug: string; thumbnail_url: string }) => `
  <url>
    <loc>${BASE_URL}/courses/${course.slug}</loc>
    <image:image>
      <image:loc>${course.thumbnail_url}</image:loc>
      <image:caption>${course.slug.replace(/-/g, ' ')} - Skillplace Academy Course</image:caption>
    </image:image>
  </url>`).join('')
  } catch {
    return ''
  }
}

export async function GET() {
  return generateImageSitemap()
}
