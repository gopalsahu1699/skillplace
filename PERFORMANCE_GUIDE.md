# Performance Guide — Skillplace Academy

## Bundle Size

### Heavy Libraries — Lazy Load
```typescript
// hls.js, jspdf, html2canvas are HUGE — never import at top level
// BAD:
import Hls from 'hls.js'

// GOOD:
const SecureVideoPlayer = dynamic(() => import('@/components/video/SecureVideoPlayer'), {
  loading: () => <VideoSkeleton />,
  ssr: false,
})
```

### Code Splitting
- Each route is automatically code-split by Next.js App Router
- Heavy components (video player, PDF viewer, certificate generator) use `dynamic()`
- Shared UI components stay in main bundle

### Tree Shaking
```typescript
// Import only what you need
// BAD: import * as z from 'zod'
// GOOD: import { z } from 'zod'

// BAD: import _ from 'lodash'
// GOOD: import debounce from 'lodash/debounce'
```

## Rendering Performance

### Server Components (default)
```typescript
// Use for data fetching + static content
// No client-side JS shipped
export default async function CoursesPage() {
  const { data } = await supabase.from('courses').select('*')
  return <CourseGrid courses={data} />
}
```

### Client Components (when needed)
```typescript
// Only add 'use client' when you need:
// - useState, useEffect, useRef
// - Event handlers (onClick, onSubmit)
// - Browser APIs (localStorage, window)
// - Third-party client libraries (HLS, Razorpay)
'use client'
```

### Memoization
```typescript
// Only when you have proven performance issues
// BAD: Premature optimization
const MemoizedComponent = memo(HeavyComponent)

// GOOD: Only after measuring
const ExpensiveList = memo(function ExpensiveList({ items }) {
  return items.map(item => <CourseCard key={item.id} course={item} />)
})
```

### Efficient Rendering
```typescript
// Use React.Fragment with key for .map()
// (jsxDEV strips key from elements in .map())
{items.map(item => (
  <React.Fragment key={item.id}>
    <CourseCard course={item} />
  </React.Fragment>
))}
```

## Database Query Performance

### Select Only Needed Columns
```typescript
// BAD: SELECT *
const { data } = await supabase.from('courses').select('*')

// GOOD: SELECT specific columns
const { data } = await supabase.from('courses').select('id, title, slug, price')
```

### Pagination
```typescript
// Use range for pagination
const { data } = await supabase
  .from('courses')
  .select('*')
  .order('created_at', { ascending: false })
  .range(0, 19) // First 20 items
```

### Efficient Joins
```typescript
// Supabase REST API joins (single request)
const { data } = await adminSupabase
  .from('enrollments')
  .select('*, profiles(email, full_name), training_programs(name, slug)')
  .eq('status', 'active')
```

### N+1 Prevention
```typescript
// BAD: Query in loop
for (const enrollment of enrollments) {
  const course = await supabase.from('courses').select('title').eq('id', enrollment.course_id)
}

// GOOD: Single query with join
const { data } = await supabase
  .from('enrollments')
  .select('*, courses(title, slug)')
```

## API Performance

### Caching Strategy
```typescript
// Static data — cache aggressively
export const revalidate = 3600 // 1 hour

// User-specific data — no cache
export const dynamic = 'force-dynamic'

// Semi-static — short cache
export const revalidate = 60 // 1 minute
```

### Efficient State Updates
```typescript
// Batch related state updates
const [state, setState] = useState({ loading: true, error: null, data: null })

// Single update, not multiple
setState({ loading: false, error: null, data: response })
```

### Debouncing
```typescript
// Debounce search inputs
import { useDebouncedCallback } from 'use-debounce'

const handleSearch = useDebouncedCallback((query) => {
  fetchSearchResults(query)
}, 300)
```

## Image Optimization

```typescript
// Use Next.js Image component for external images
import Image from 'next/image'

<Image
  src={course.thumbnail_url}
  alt={course.title}
  width={400}
  height={225}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

// Use AVIF/WebP formats
// Serve responsive sizes
// Lazy load below-fold images
```

## Video Optimization

```typescript
// HLS.js for adaptive streaming
// Cloudflare Stream for CDN delivery
// Lazy load video player when in viewport
// Preload="metadata" not "auto"
```

## Core Web Vitals Targets

| Metric | Target | Current Priority |
|--------|--------|-----------------|
| LCP | < 2.5s | Optimize images, lazy load |
| FID/INP | < 100ms | Reduce JS, code split |
| CLS | < 0.1 | Set image dimensions, avoid layout shift |
| TTFB | < 800ms | Edge deployment, caching |
| FCP | < 1.8s | Critical CSS inline |

## Monitoring

```typescript
// Log slow queries
console.time('fetch-courses')
const { data } = await supabase.from('courses').select('*')
console.timeEnd('fetch-courses')

// Track errors
// Use Sentry or similar for production error tracking
```
