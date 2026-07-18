import type { Metadata } from 'next'

const BASE_URL = 'https://www.skillplace.in'
export const SITE_NAME = 'Skillplace Academy'
export const SITE_DESCRIPTION = 'India\'s leading engineering skill development academy. Learn AutoCAD, Revit, SolidWorks, PLC programming and more with practical training and 100% placement assistance in Bilaspur, Chhattisgarh.'
export const SITE_KEYWORDS = [
  'skillplace academy',
  'engineering courses Bilaspur',
  'AutoCAD training',
  'Revit architecture course',
  'SolidWorks training',
  'PLC programming course',
  'civil engineering courses',
  'mechanical engineering courses',
  'electrical engineering training',
  'electronics automation course',
  'engineering placement assistance',
  'skill development India',
  'CAD training center',
  'BIM modeling course',
  'engineering career guidance',
  'practical engineering training',
  'job oriented courses',
  'engineering certification',
  'Chhattisgarh skill training',
]

export function createMetadata(overrides: {
  title: string
  description: string
  path: string
  keywords?: string[]
  ogImage?: string
  publishedTime?: string
  modifiedTime?: string
  noIndex?: boolean
}): Metadata {
  const url = `${BASE_URL}${overrides.path}`
  const images = overrides.ogImage
    ? [{ url: overrides.ogImage, width: 1200, height: 630, alt: overrides.title }]
    : [{ url: `${BASE_URL}/android-chrome-512x512.png`, width: 512, height: 512, alt: SITE_NAME }]

  return {
    title: overrides.title,
    description: overrides.description,
    keywords: [...SITE_KEYWORDS, ...(overrides.keywords || [])].join(', '),
    metadataBase: new URL(BASE_URL),
    alternates: { canonical: url },
    robots: overrides.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      title: overrides.title,
      description: overrides.description,
      url,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type: 'website',
      images,
      ...(overrides.publishedTime && { publishedTime: overrides.publishedTime }),
      ...(overrides.modifiedTime && { modifiedTime: overrides.modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: overrides.title,
      description: overrides.description,
      images,
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        { url: '/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    manifest: '/manifest.webmanifest',
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
    },
  }
}

export const homepageMetadata = {
  title: 'Skillplace Academy - Build Skills. Build Career. | Engineering Training in Bilaspur',
  description: SITE_DESCRIPTION,
  path: '/',
  keywords: [
    'best engineering academy Bilaspur',
    'skill development center Chhattisgarh',
    'job oriented training programs',
    'engineering practical training',
    'placement assistance Bilaspur',
  ],
}

export const coursesMetadata = {
  title: 'Engineering Courses - AutoCAD, Revit, SolidWorks, PLC | Skillplace Academy',
  description: 'Browse 30+ industry-relevant engineering courses including AutoCAD, Revit Architecture, SolidWorks, PLC Programming, and more. Live projects, expert mentors, certification included.',
  path: '/courses',
  keywords: ['CAD courses', 'BIM training', 'PLC SCADA course', 'engineering software training', 'online engineering classes'],
}

export const programsMetadata = {
  title: 'Job-Oriented Engineering Programs | 100% Placement Assistance | Skillplace Academy',
  description: 'Comprehensive 12-48 week engineering programs in Civil, Mechanical, Electrical & Electronics. Hands-on training, industry certification, and guaranteed placement support.',
  path: '/programs',
  keywords: ['engineering training program', 'job guarantee course', 'placement program India', 'engineering upskilling', 'career transition program'],
}

export const aboutMetadata = {
  title: 'About Skillplace Academy | India\'s Premier Engineering Skill Development Academy',
  description: 'Learn about Skillplace Academy\'s mission to bridge the gap between academic knowledge and industry requirements. 2000+ students trained, expert mentors, practical-focused curriculum.',
  path: '/about',
  keywords: ['about engineering academy', 'skillplace team', 'engineering mentors India', 'skill development mission', 'academy Bilaspur'],
}

export const contactMetadata = {
  title: 'Contact Skillplace Academy | Admissions & Career Counseling | Bilaspur',
  description: 'Get in touch with Skillplace Academy. Visit our campus in Bilaspur, call +91 79878 14261, or email skillplaceacademy@gmail.com. Free career counseling available.',
  path: '/contact',
}

export const placementsMetadata = {
  title: 'Placement Assistance | 95% Placement Rate | Skillplace Academy',
  description: 'Skillplace Academy\'s dedicated placement cell helps you land your dream engineering job. 200+ hiring partners, mock interviews, resume building, and career guidance included.',
  path: '/placements',
  keywords: ['engineering placements', 'job assistance program', 'campus placement', 'interview preparation', 'hiring partners India'],
}

export const faqMetadata = {
  title: 'Frequently Asked Questions | Skillplace Academy',
  description: 'Find answers to common questions about admissions, courses, fees, certifications, placement support, online/offline classes, and career guidance at Skillplace Academy.',
  path: '/faq',
}

export const termsMetadata = {
  title: 'Terms and Conditions | Skillplace Academy',
  description: 'Terms and conditions governing enrollment, fees, refunds, placement assistance, and use of Skillplace Academy\'s educational services and platform.',
  path: '/terms',
}

export const privacyMetadata = {
  title: 'Privacy Policy | Skillplace Academy',
  description: 'Privacy policy explaining how Skillplace Academy collects, uses, and protects your personal information. Your data security is our priority.',
  path: '/privacy',
}
