# SEO / AEO / GEO / LLMO — Skillplace Academy

## Per-Page Checklist

### SEO
- [ ] Title tag (50-60 chars): "Course Name | Skillplace Academy"
- [ ] Meta description (150-160 chars): Include keywords + value prop
- [ ] Canonical URL
- [ ] Robots: index, follow (public pages)
- [ ] Internal linking to related courses/programs
- [ ] Open Graph (title, description, image, url, type)
- [ ] Twitter Card (summary_large_image)
- [ ] Breadcrumbs (structured data)
- [ ] Semantic HTML (h1-h6 hierarchy, main, article, nav)
- [ ] Technical: clean URLs, no 404s, HTTPS
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Structured data (Course, BreadcrumbList, Organization)
- [ ] Mobile responsive
- [ ] Sitemap includes page
- [ ] robots.txt allows page

### AEO (Answer Engine Optimization)
- [ ] FAQ section on course/program pages
- [ ] Question-and-answer formatting
- [ ] Concise answers (40-60 words)
- [ ] Clear headings (H2 for questions)
- [ ] Definition sections for key terms

### GEO / LLMO (Generative Engine / LLM Optimization)
- [ ] Well-structured Markdown content
- [ ] Schema markup (Course, Organization, Review)
- [ ] Entity-rich content (mention Skillplace, Bilaspur, India)
- [ ] Clear context in first 100 words
- [ ] Source citations where relevant
- [ ] Machine-readable content (no walls of text)

### E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
- [ ] Author information on blog posts
- [ ] Contact information visible
- [ ] About page with team credentials
- [ ] Privacy policy linked
- [ ] Terms of service linked
- [ ] Trust indicators (student count, ratings)
- [ ] Testimonials with real names
- [ ] Reviews displayed prominently

## Page-Specific Metadata

### Home Page
```
Title: Skillplace Academy | Civil, Mechanical & Electrical Engineering Courses
Description: Learn engineering skills online and offline. Industry-aligned courses in Civil, Mechanical, Electrical & Electronics. 100% job assistance. Enroll now.
```

### Course Page
```
Title: {Course Name} Course | Skillplace Academy
Description: {Short description}. Learn {skill} with hands-on training. {Duration} course. Enroll from ₹{price}.
```

### Program Page
```
Title: {Program Name} | Skillplace Academy
Description: {Program type} program in {branch}. {Duration} weeks. Includes {key features}. 100% job assistance.
```

### About Page
```
Title: About Skillplace Academy | Engineering Training Institute
Description: Skillplace Academy is a leading engineering training institute in Bilaspur, India. Industry-aligned courses with placement support.
```

## Structured Data Templates

### Course
```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "AutoCAD 2D",
  "description": "Master 2D drafting with AutoCAD",
  "provider": {
    "@type": "Organization",
    "name": "Skillplace Academy"
  },
  "offers": {
    "@type": "Offer",
    "price": "4999",
    "priceCurrency": "INR"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "120"
  }
}
```

### Organization
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Skillplace Academy",
  "url": "https://skillplace.academy",
  "logo": "https://skillplace.academy/logo.png",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Bilaspur",
    "addressRegion": "Chhattisgarh",
    "addressCountry": "IN"
  }
}
```

### BreadcrumbList
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://skillplace.academy" },
    { "@type": "ListItem", "position": 2, "name": "Courses", "item": "https://skillplace.academy/courses" },
    { "@type": "ListItem", "position": 3, "name": "AutoCAD 2D" }
  ]
}
```

## Sitemap Priority
```
/ (1.0)
/courses (0.9)
/programs (0.9)
/about (0.8)
/contact (0.7)
/courses/[slug] (0.8)
/programs/[slug] (0.8)
/admin-place (0.0 - noindex)
/api/* (0.0 - noindex)
```
