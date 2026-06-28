# OpenCode Rules — Skillplace Academy

## Who is OpenCode?

OpenCode is the AI coding engine. It receives plans from OWL and produces working code.

## Rules OpenCode MUST Follow

### 1. Zero Errors
- `npx tsc --noEmit` must pass with 0 errors
- `npm run build` must pass
- If OpenCode introduces an error, it must fix it before returning

### 2. No Code Modifications by OWL
- OWL never touches OpenCode's output
- If something needs changing, OWL creates a new plan
- OpenCode regenerates the file completely

### 3. Follow Plans Exactly
- OpenCode receives: task description, constraints, DB schema, reference code
- Do NOT deviate from the plan
- Ask OWL if clarification needed, don't guess

### 4. Import Rules
```typescript
// Always use @/ path alias
import { supabase } from '@/lib/supabase/client'
import { adminSupabase } from '@/lib/supabase/admin'
import { cn } from '@/lib/utils'

// Never use relative imports beyond 2 levels
// BAD: import { foo } from '../../../lib/helpers'
// GOOD: import { foo } from '@/lib/helpers'
```

### 5. No Prohibited Patterns
```typescript
// NEVER
import { Dialog } from '@/components/ui/dialog'  // Turbopack bug
import adminSupabase from '@/lib/supabase/admin' into client.ts  // key exposure
const result = await supabase.rpc('query', { param: `${userInput}` })  // injection risk

// ALWAYS
<div className="modal">...</div>  // Div-based modal
import { adminSupabase } from '@/lib/supabase/admin' // Server files only
.from('users').select('*').eq('id', userId) // Parameterized
```

### 6. File Naming
- Components: PascalCase (CourseCard.tsx)
- Hooks: useXxx (useAuth.ts)
- Utils: camelCase (formatDate.ts)
- Pages: lowercase folders (courses/page.tsx)
- API routes: lowercase folders (api/students/route.ts)

### 7. Component Export
```typescript
// Pages: default export (Next.js requirement)
export default function CoursesPage() { ... }

// Components: default export (for dynamic imports)
export default function CourseCard({ course }: Props) { ... }

// Utils: named export
export function formatPrice(amount: number): string { ... }
```

### 8. Error Handling
```typescript
// Every API route must have:
try {
  // logic
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  return NextResponse.json({ error: message }, { status: 500 })
}

// Client components:
try {
  await mutate()
} catch (error) {
  setError(error instanceof Error ? error.message : 'Failed')
}
```

### 9. Database Query Patterns
```typescript
// Single record
const { data } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', userId)
  .maybeSingle()

// List with filter
const { data } = await supabase
  .from('courses')
  .select('id, title, price')
  .eq('is_active', true)
  .order('created_at', { ascending: false })

// Admin query (bypasses RLS)
const { data } = await adminSupabase
  .from('enrollments')
  .select('*, profiles(email), courses(title)')
```

### 10. Environment Variables
```typescript
// Client-safe only in client code
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Service role only in server files
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Always check existence
if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
```

### 11. No Console Logs in Production
```typescript
// OK in development only
if (process.env.NODE_ENV === 'development') {
  console.log('debug:', data)
}

// NEVER: console.log with sensitive data
// NEVER: console.log in error handlers (use proper error response)
```

### 12. Testing
- Write tests for utility functions
- Write tests for API routes
- Use vitest or jest
- Test file: `*.test.ts` or `*.spec.ts`
