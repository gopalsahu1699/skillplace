const BASE_URL = 'https://www.skillplace.in'
const ORG_NAME = 'Skillplace Academy'
const ORG_DESCRIPTION = 'Industry-leading engineering skill development academy offering practical training in Civil, Mechanical, Electrical, and Electronics engineering with 100% placement assistance.'
const LOGO_URL = 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/skillplace_logo.jpg'
const ADDRESS = {
  street: '1st floor, SD EPITOME, Gandhi chowk, beside Patel tutorial, Old High Court Rd',
  locality: 'Bilaspur',
  region: 'Chhattisgarh',
  postalCode: '495004',
  country: 'IN',
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${BASE_URL}/#organization`,
    name: ORG_NAME,
    url: BASE_URL,
    logo: LOGO_URL,
    description: ORG_DESCRIPTION,
    foundingDate: '2020',
    address: {
      '@type': 'PostalAddress',
      streetAddress: ADDRESS.street,
      addressLocality: ADDRESS.locality,
      addressRegion: ADDRESS.region,
      postalCode: ADDRESS.postalCode,
      addressCountry: ADDRESS.country,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-79878-14261',
      contactType: 'admissions',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      'https://www.skillplace.in',
      'https://www.facebook.com/skillplaceacademy',
      'https://www.instagram.com/skillplace.academy',
      'https://www.linkedin.com/company/skillplace-academy',
      'https://www.youtube.com/@skillplaceacademy',
    ],
    knowsAbout: [
      'Civil Engineering',
      'Mechanical Engineering',
      'Electrical Engineering',
      'Electronics Engineering',
      'AutoCAD',
      'Revit',
      'SolidWorks',
      'PLC Programming',
      'BIM Modeling',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      bestRating: '5',
      ratingCount: '500+',
    },
    areaServed: [
      { '@type': 'City', name: 'Bilaspur' },
      { '@type': 'City', name: 'Korba' },
      { '@type': 'City', name: 'Raigarh' },
      { '@type': 'City', name: 'Janjgir Champa' },
      { '@type': 'City', name: 'Mungeli' },
      { '@type': 'City', name: 'Raipur' },
      { '@type': 'City', name: 'Balodabazar' },
      { '@type': 'City', name: 'Bhatapara' },
      { '@type': 'City', name: 'Champa' },
      { '@type': 'City', name: 'Ratanpur' },
      { '@type': 'State', name: 'Chhattisgarh' },
    ],
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    name: ORG_NAME,
    url: BASE_URL,
    description: ORG_DESCRIPTION,
    publisher: { '@id': `${BASE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/courses?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['en-IN', 'hi'],
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${BASE_URL}/#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  }
}

export function courseSchema(course: {
  title: string
  slug: string
  description?: string | null
  short_description?: string | null
  price: number
  discount_price?: number | null
  duration_hours?: number | null
  level?: string | null
  thumbnail_url?: string | null
  branches?: { name: string; slug: string } | null
  enrollmentCount?: number
}) {
  const offers = course.discount_price
    ? {
        '@type': 'Offer',
        price: course.discount_price,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        validFrom: new Date().toISOString().split('T')[0],
      }
    : {
        '@type': 'Offer',
        price: course.price,
        priceCurrency: 'INR',
        availability: course.price === 0 ? 'https://schema.org/OnlineOnly' : 'https://schema.org/InStock',
      }

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${BASE_URL}/courses/${course.slug}#course`,
    name: course.title,
    description: course.short_description || course.description || `Learn ${course.title} at Skillplace Academy with hands-on practical training and placement assistance.`,
    url: `${BASE_URL}/courses/${course.slug}`,
    image: course.thumbnail_url || LOGO_URL,
    provider: {
      '@type': 'EducationalOrganization',
      '@id': `${BASE_URL}/#organization`,
      name: ORG_NAME,
      sameAs: BASE_URL,
    },
    offers,
    ...(course.duration_hours && {
      timeRequired: `PT${course.duration_hours}H`,
    }),
    ...(course.level && {
      educationalLevel: course.level.charAt(0).toUpperCase() + course.level.slice(1),
    }),
    ...(course.branches && {
      about: { '@type': 'Thing', name: course.branches.name },
    }),
    ...(course.enrollmentCount && {
      aggregateRating: undefined,
    }),
    inLanguage: 'en-IN',
    isAccessibleForFree: course.price === 0,
    educationalCredentialAwarded: 'Certificate of Completion',
  }
}

export function courseInstanceSchema(course: {
  title: string
  slug: string
  description?: string | null
  price: number
  discount_price?: number | null
  duration_hours?: number | null
  level?: string | null
  branches?: { name: string; slug: string } | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CourseInstance',
    courseMode: ['ONSITE', 'ONLINE'],
    courseWorkload: course.duration_hours ? `PT${course.duration_hours}H` : undefined,
    instructor: {
      '@type': 'Person',
      name: 'Skillplace Academy Faculty',
      affiliation: { '@id': `${BASE_URL}/#organization` },
    },
    offers: {
      '@type': 'Offer',
      price: course.discount_price || course.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
  }
}

export function learningResourceSchema(course: {
  title: string
  slug: string
  description?: string | null
  price: number
  level?: string | null
  duration_hours?: number | null
  branches?: { name: string; slug: string } | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: course.title,
    description: course.description || `Comprehensive ${course.title} training program`,
    url: `${BASE_URL}/courses/${course.slug}`,
    educationalLevel: course.level || 'Beginner',
    timeRequired: course.duration_hours ? `PT${course.duration_hours}H` : undefined,
    teaches: [`${course.title} skills`, 'Practical engineering techniques', 'Industry-standard workflows'],
    provider: { '@id': `${BASE_URL}/#organization` },
  }
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${BASE_URL}/faq#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}

export function reviewSchema(review: {
  student_name: string
  course_name?: string | null
  rating: number
  review: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Course',
      name: review.course_name || 'Skillplace Academy Program',
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: '5',
    },
    author: {
      '@type': 'Person',
      name: review.student_name,
    },
    reviewBody: review.review,
  }
}

export function aggregateRatingSchema(ratingValue: number, ratingCount: number, itemName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    itemReviewed: {
      '@type': 'Course',
      name: itemName,
    },
    ratingValue: ratingValue.toString(),
    bestRating: '5',
    ratingCount: ratingCount.toString(),
  }
}

export function personSchema(person: {
  name: string
  jobTitle?: string
  image?: string
  description?: string
  url?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    ...(person.jobTitle && { jobTitle: person.jobTitle }),
    ...(person.image && { image: person.image }),
    ...(person.description && { description: person.description }),
    ...(person.url && { url: person.url }),
    affiliation: { '@id': `${BASE_URL}/#organization` },
  }
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#localbusiness`,
    name: ORG_NAME,
    image: LOGO_URL,
    url: BASE_URL,
    telephone: '+91-79878-14261',
    email: 'skillplaceacademy@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: ADDRESS.street,
      addressLocality: ADDRESS.locality,
      addressRegion: ADDRESS.region,
      postalCode: ADDRESS.postalCode,
      addressCountry: ADDRESS.country,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '19:00',
      },
    ],
    priceRange: '₹5000 - ₹40000',
    areaServed: ['Bilaspur', 'Korba', 'Raigarh', 'Janjgir Champa', 'Mungeli', 'Raipur', 'Balodabazar', 'Bhatapara', 'Champa', 'Ratanpur', 'Chhattisgarh', 'India'],
    hasMap: 'https://maps.app.goo.gl/Vc4F1FaXwHD1dAn87',
  }
}

export function educationalOccupationalProgramSchema(program: {
  name: string
  slug: string
  description?: string | null
  duration_weeks?: number | null
  price: number
  discount_price?: number | null
  program_type?: string | null
  branches?: { name: string; slug: string } | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: program.name,
    description: program.description || `${program.name} at Skillplace Academy`,
    url: `${BASE_URL}/programs/${program.slug}`,
    provider: { '@id': `${BASE_URL}/#organization` },
    ...(program.duration_weeks && {
      timeToComplete: `P${program.duration_weeks}W`,
    }),
    ...(program.program_type && {
      educationalProgramMode: program.program_type.toUpperCase(),
    }),
    ...(program.branches && {
      occupationalCategory: program.branches.name,
    }),
    offers: {
      '@type': 'Offer',
      price: program.discount_price || program.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    occupationalCredentialAwarded: 'Professional Certificate',
  }
}

export function productSchema(course: {
  title: string
  slug: string
  description?: string | null
  price: number
  discount_price?: number | null
  thumbnail_url?: string | null
  branches?: { name: string } | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BASE_URL}/courses/${course.slug}#product`,
    name: course.title,
    description: course.description || `${course.title} - Engineering Course at Skillplace Academy`,
    image: course.thumbnail_url || LOGO_URL,
    category: course.branches?.name || 'Engineering Training',
    brand: {
      '@type': 'Brand',
      name: ORG_NAME,
    },
    offers: {
      '@type': 'Offer',
      price: course.discount_price || course.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/courses/${course.slug}`,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    },
  }
}

export function aboutPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${BASE_URL}/about#aboutpage`,
    url: `${BASE_URL}/about`,
    name: 'About Skillplace Academy',
    description: ORG_DESCRIPTION,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    primaryImageOfPage: { '@type': 'ImageObject', url: LOGO_URL },
  }
}

export function contactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${BASE_URL}/contact#contactpage`,
    url: `${BASE_URL}/contact`,
    name: 'Contact Skillplace Academy',
    description: 'Contact Skillplace Academy for admissions, career counseling, and program inquiries.',
    isPartOf: { '@id': `${BASE_URL}/#website` },
  }
}

export function videoObjectSchema(video: {
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  durationMinutes?: number | null
  contentUrl?: string
  embedUrl?: string
  uploadDate?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description || video.title,
    ...(video.thumbnailUrl && { thumbnailUrl: video.thumbnailUrl }),
    ...(video.durationMinutes && { duration: `PT${video.durationMinutes}M` }),
    ...(video.contentUrl && { contentUrl: video.contentUrl }),
    ...(video.embedUrl && { embedUrl: video.embedUrl }),
    uploadDate: video.uploadDate || new Date().toISOString(),
    publisher: { '@id': `${BASE_URL}/#organization` },
  }
}

export function speakableSchema(path: string, cssSelector: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector,
    },
    url: `${BASE_URL}${path}`,
  }
}

export function howToSchema(steps: { name: string; text: string; url?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Enroll at Skillplace Academy',
    description: 'Steps to enroll in Skillplace Academy engineering programs',
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: step.url ? `${BASE_URL}${step.url}` : undefined,
    })),
  }
}

export function itemListSchema<T>(items: T[], itemType: string, nameFn: (item: T) => string, urlFn: (item: T) => string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': itemType,
        name: nameFn(item),
        url: `${BASE_URL}${urlFn(item)}`,
      },
    })),
  }
}

export function pageSchema(path: string, title: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${BASE_URL}${path}#webpage`,
    url: `${BASE_URL}${path}`,
    name: title,
    description: description,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    about: { '@id': `${BASE_URL}/#organization` },
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    inLanguage: 'en-IN',
    breadcrumb: { '@id': `${BASE_URL}/#breadcrumb` },
    primaryImageOfPage: { '@type': 'ImageObject', url: LOGO_URL },
  }
}

export function articleSchema(article: {
  title: string
  description: string
  datePublished: string
  dateModified: string
  authorName: string
  imageUrl?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      '@type': 'Person',
      name: article.authorName,
    },
    publisher: { '@id': `${BASE_URL}/#organization` },
    ...(article.imageUrl && { image: article.imageUrl }),
  }
}
