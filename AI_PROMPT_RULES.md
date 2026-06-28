# AI Prompt Rules — Skillplace Academy

## Prompt Construction for OpenCode

Always provide:
1. **Context**: What the app does, current architecture
2. **Task**: Exactly what to implement
3. **Constraints**: DB schema, file paths, RLS, security rules
4. **Reference**: Existing similar code, .sql files, API patterns
5. **Verification**: How to verify it works (tsc, build, E2E)
6. **No-errors rule**: Zero tolerance for TypeScript errors

## Prompt Template

```
CONTEXT:
- App: Skillplace Academy (Next.js 16 + Supabase + Razorpay)
- File: [exact file path to create/modify]
- DB: See supabase/{table}.sql for schema

TASK:
- [Specific implementation request]

CONSTRAINTS:
- Use imports from @/lib/supabase/client.ts (client) or @/lib/supabase/admin.ts (admin)
- No @/components/ui/dialog — use div-based modals
- RLS enabled on all user data tables — use adminSupabase for admin operations
- .sql schema changes must update the specific table file in supabase/
- NEVER modify middleware.ts unless specifically asked

DB SCHEMA REFERENCE:
[Include relevant table schema from supabase/]

SIMILAR CODE:
[Point to existing implementation as reference]

VERIFICATION:
- npx tsc --noCompile must pass
- npm run build must pass
- No console.log, no TODO

NO ERRORS ALLOWED.
```

## Research Prompt Template

```
RESEARCH: [What to research]

EVALUATE ON:
1. Performance impact
2. Maintenance burden
3. Security implications
4. Scalability
5. Community support / GitHub stars
6. Cost if applicable

COMPARE: [Option A] vs [Option B] vs [Option C]

RECOMMEND with trade-offs.
```

## Review Prompt Template

```
REVIEW: [code/file/path]

CHECK FOR:
1. TypeScript correctness
2. Security (auth, injection, XSS)
3. Performance (N+1, unnecessary re-renders)
4. Bundle size (heavy imports)
5. Error handling completeness
6. Consistency with existing patterns

SEVERITY: CRITICAL | HIGH | MEDIUM | LOW

Suggest fixes with file paths and code snippets.
```

## Bug Investigation Template

```
BUG: [Description]

INVESTIGATION:
1. Reproduce mentally: [steps]
2. Check: [relevant files]
3. Root cause: [hypothesis]
4. Verify: [command/log to check]

FIX PLAN:
- File: [path]
- Change: [specific fix]
- Verification: [command]
```

## DB Schema Change Template

```
DB CHANGE: [What to change]

TABLE: supabase/{table}.sql

CURRENT SCHEMA:
[CREATE TABLE statement]

DESIRED SCHEMA:
[Modified CREATE TABLE with changes]

ALTER TABLE SQL:
ALTER TABLE public.{table} ADD COLUMN IF NOT EXISTS {column} {type};

RL CHANGES:
[New or modified RLS policies]

INDEX NEEDED:
[CREATE INDEX statements if applicable]
```
