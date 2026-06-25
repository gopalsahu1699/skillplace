## Task: Add "My Purchased Programs" section to /programs page

### Overview
Add a new section at the top of the `/programs` page (after the header, before the branch tabs) that shows the currently logged-in user's purchased/enrolled programs. This section should only appear when a user is authenticated and has enrollments.

### Project Location
- Working directory: `C:\auto_skillplace\skillplace`
- Real path: `D:\web software developement\skillplaceacademy\skillplace`
- File to modify: `src/app/programs/page.tsx`

### Database Schema (enrollments table)
```sql
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  program_id uuid REFERENCES training_programs(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  notes text,
  enrolled_at timestamptz DEFAULT NOW(),
  completed_at timestamptz,
  program_type text
)
```

### What to Implement

1. **Add a new section** between the page header and the branch tabs section in `src/app/programs/page.tsx`

2. **Fetch user's enrollments**: After getting the user, query the `enrollments` table for their enrolled programs:
   - Use the anon client `supabase` (already imported)
   - Query: `supabase.from('enrollments').select('*,training_programs(*)').eq('user_id', user.id).eq('status', 'active')`
   - Filter by status = 'active' to show only confirmed purchases

3. **Section layout** (only shows when user is logged in AND has active enrollments):
   - Section title: "My Purchased Programs" with a graduation cap or similar icon
   - Grid of cards (1 column on mobile, 2 on md, 3 on lg) — same style as the existing program cards
   - Each card shows:
     - Program name
     - Branch name (from the joined training_programs → branches relation)
     - Program type badge (online/offline/hybrid with same color config already defined)
     - Enrollment date
     - "Go to Program" button linking to `/programs/${program.slug}`
   - Use the same card styling pattern as the existing program cards (white bg, rounded-2xl, border, hover shadow)

4. **Data handling**:
   - The enrollment data has `training_programs(*)` joined which gives program details
   - Access via `enrollment.training_programs` (it will be an object since it's a FK join)
   - Handle the case where `training_programs` might be null (skip those records)

5. **Loading state**: Show a skeleton or loading text while fetching enrollments

### Styling Requirements
- Use ONLY Tailwind CSS classes — no inline styles, no CSS-in-JS
- Match the existing design language of the page (same colors, spacing, card style)
- Section should have appropriate spacing (mb-8 or mb-10 below it)

### DO NOT
- Do NOT modify any other files
- Do NOT add new API routes
- Do NOT change the existing program listing logic
- Do NOT use inline `style={{}}` — Tailwind only
- Do NOT use `window.print()` anywhere
- Do NOT break the existing branch tabs / program grid below

### After Completion
1. Run `npx tsc --noEmit` and fix ALL type errors
2. Verify the page still builds correctly
3. Do NOT git push
