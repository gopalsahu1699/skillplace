import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Skillplace Academy - Engineering Skills Training',
    short_name: 'Skillplace',
    description: "India's leading engineering skill development academy. Practical training, expert mentors, 100% placement assistance in Bilaspur, Chhattisgarh.",
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f9ff',
    theme_color: '#131b2e',
    orientation: 'portrait-primary',
    lang: 'en-IN',
    dir: 'ltr',
    categories: ['education', 'engineering', 'training', 'career'],
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    prefer_related_applications: false,
    scope: '/',
  }
}
