import type { Metadata } from 'next'

const BASE_URL = 'https://www.skillplace.in'
export const SITE_NAME = 'Skillplace Academy'
export const SITE_DESCRIPTION = 'India\'s leading engineering skill development academy. Learn AutoCAD, Revit, SolidWorks, PLC programming and more with practical training and 100% placement assistance in Bilaspur, Chhattisgarh.'
export const SITE_KEYWORDS = [
  'skillplace academy',
  'SkillPlace Academy Bilaspur',
  'Engineering Training Bilaspur',
  'Engineering Institute Bilaspur',
  'Placement Training Bilaspur',
  'Best Engineering Institute in Bilaspur',
  'Civil Engineering Training Bilaspur',
  'Electrical Engineering Training Bilaspur',
  'Mechanical Engineering Training Bilaspur',
  'Skill Development Institute Bilaspur',
  'Engineering Coaching Bilaspur',
  'Engineering Placement Assistance',
  'Engineering Academy Chhattisgarh',
  'AutoCAD training',
  'Revit architecture course',
  'SolidWorks training',
  'PLC programming course',
  'civil engineering courses',
  'mechanical engineering courses',
  'electrical engineering training',
  'electronics automation course',
  'skill development India',
  'CAD training center',
  'BIM modeling course',
  'engineering career guidance',
  'practical engineering training',
  'job oriented courses',
  'engineering certification',
  'Chhattisgarh skill training',
  'Job Oriented Engineering Course',
  'Technical Training Institute',
  'Industry Ready Engineers',
  'Core Engineering Jobs',
  'Engineering Skill Development',
  'Engineering Career Guidance',
  'Engineering Interview Preparation',
  'Engineering Soft Skills',
  'Live Engineering Projects',
  'Engineering Training with Placement',
  'Bilaspur Chhattisgarh',
  'Korba',
  'Raigarh',
  'Janjgir Champa',
  'Mungeli',
  'Raipur',
  'Balodabazar',
  'Bhatapara',
  'Champa',
  'Ratanpur',
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
    'SkillPlace Academy Bilaspur',
    'Engineering Training Bilaspur',
    'Placement Training Bilaspur',
    'Best Engineering Institute in Bilaspur',
    'skill development center Chhattisgarh',
    'job oriented training programs',
    'engineering practical training',
    'placement assistance Bilaspur',
    'Engineering Coaching Bilaspur',
  ],
}

export const coursesMetadata = {
  title: 'Engineering Courses in Bilaspur - AutoCAD, Revit, SolidWorks, PLC | Skillplace Academy',
  description: 'Explore 30+ engineering courses in Bilaspur including AutoCAD, Revit Architecture, SolidWorks, PLC Programming, and more. Practical training with live projects, expert mentors, and certification.',
  path: '/courses',
  keywords: ['Engineering Training Bilaspur', 'Civil Engineering Training Bilaspur', 'Electrical Engineering Training Bilaspur', 'Mechanical Engineering Training Bilaspur', 'CAD courses', 'BIM training', 'PLC SCADA course', 'engineering software training'],
}

export const programsMetadata = {
  title: 'Job-Oriented Engineering Programs Bilaspur | 100% Placement Assistance | Skillplace Academy',
  description: 'Comprehensive 12-48 week engineering programs in Bilaspur for Civil, Mechanical & Electrical. Hands-on training, industry certification, and guaranteed placement support.',
  path: '/programs',
  keywords: ['Engineering Training Bilaspur', 'Placement Training Bilaspur', 'Job Oriented Engineering Course', 'engineering training program', 'job guarantee course', 'placement program India', 'engineering upskilling'],
}

export const aboutMetadata = {
  title: 'About Skillplace Academy Bilaspur | Best Engineering Training Institute',
  description: 'Learn about Skillplace Academy Bilaspur - the best engineering training institute bridging the gap between academic knowledge and industry requirements. 2000+ students trained, expert mentors.',
  path: '/about',
  keywords: ['SkillPlace Academy Bilaspur', 'Engineering Institute Bilaspur', 'Best Engineering Institute in Bilaspur', 'about engineering academy', 'skillplace team', 'engineering mentors India', 'skill development mission'],
}

export const contactMetadata = {
  title: 'Contact Skillplace Academy | Best Engineering Institute in Bilaspur',
  description: 'Contact Skillplace Academy Bilaspur for admissions, career counseling & demo class booking. Call +91 79878 14261. Civil, Electrical & Mechanical engineering training with placement.',
  path: '/contact',
}

export const placementsMetadata = {
  title: 'Placement Assistance Bilaspur | Engineering Placement Training | Skillplace Academy',
  description: 'Skillplace Academy Bilaspur offers engineering placement assistance with 200+ hiring partners. Placement training, mock interviews, resume building, and career guidance for civil, electrical & mechanical engineers.',
  path: '/placements',
  keywords: ['Placement Training Bilaspur', 'Engineering Placement Assistance', 'engineering placements', 'job assistance program', 'campus placement', 'interview preparation', 'hiring partners India'],
}

export const faqMetadata = {
  title: 'FAQ - Engineering Training Bilaspur | Skillplace Academy',
  description: 'Find answers about engineering training in Bilaspur at Skillplace Academy — admissions, courses, fees, certifications, placement support, online/offline classes, and career guidance.',
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
