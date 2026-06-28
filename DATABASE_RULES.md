# Database Rules — Skillplace Academy

## Folder: `supabase/`

Each table has its own `.sql` file:
```
supabase/
├── profiles.sql
├── employees.sql
├── branches.sql
├── courses.sql
├── modules.sql
├── lessons.sql
├── training_programs.sql
├── program_courses.sql
├── enrollments.sql
├── tests.sql
├── test_questions.sql
├── test_attempts.sql
├── certificates.sql
├── coupons.sql
├── leads.sql
├── testimonials.sql
├── user_sessions.sql
├── notifications.sql
├── course_progress.sql
├── live_classes.sql
└── student_projects.sql
```

## Rule: Per-Table SQL Files Only

- Each file contains: `CREATE TABLE IF NOT EXISTS` + RLS + indexes
- No data (INSERT statements)
- No combined/migration files
- To modify a table → edit only that table's .sql file
- To add a table → create a new `.sql` file
- To remove a table → DELETE the .sql file + add DROP TABLE to a note

## Rule: Execution Order

Due to FK dependencies, run in this order:
1. `branches.sql` (no deps)
2. `profiles.sql` (depends on auth.users)
3. `employees.sql` (no deps)
4. `courses.sql` (depends on branches)
5. `modules.sql` (depends on courses)
6. `lessons.sql` (depends on modules)
7. `training_programs.sql` (depends on branches)
8. `program_courses.sql` (depends on training_programs, courses)
9. `enrollments.sql` (depends on profiles, training_programs, branches)
10. `tests.sql` (depends on courses)
11. `test_questions.sql` (depends on tests)
12. `test_attempts.sql` (depends on profiles, tests)
13. `certificates.sql` (depends on profiles, courses)
14. `coupons.sql` (no deps)
15. `leads.sql` (no deps)
16. `testimonials.sql` (no deps)
17. `user_sessions.sql` (depends on profiles)
18. `notifications.sql` (depends on profiles)
19. `course_progress.sql` (depends on profiles, courses)
20. `live_classes.sql` (depends on courses)
21. `student_projects.sql` (depends on profiles, courses)

## Column Naming Convention

- Primary keys: `id`
- Foreign keys: `{table}_id` (e.g., `user_id`, `course_id`)
- Timestamps: `created_at`, `updated_at`, `completed_at`, `issued_at`
- Boolean flags: `is_active`, `is_featured`, `is_approved`, `is_read`
- JSON data: `features`, `answers`, `metadata`

## RLS Rules

Every RLS-secured table must have:
```sql
-- 1. Enable RLS
ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY;

-- 2. Public read for catalog tables (if is_active)
CREATE POLICY "Anyone can view active {table}" ON public.{table}
  FOR SELECT USING (is_active = true);

-- 3. Owner access for user-owned tables
CREATE POLICY "Users can view own {table}" ON public.{table}
  FOR SELECT USING (auth.uid() = user_id);

-- 4. Admin access for all management
CREATE POLICY "Admins can manage {table}" ON public.{table}
  FOR USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

## Index Rules

- Index all foreign key columns
- Index columns used in WHERE clauses (status, slug, is_active)
- Index columns used in ORDER BY (created_at)
- Use partial indexes for common filtered queries

```sql
CREATE INDEX idx_{table}_{fk} ON public.{table}({fk}_id);
CREATE INDEX idx_{table}_status ON public.{table}(status);
CREATE INDEX idx_{table}_active ON public.{table}(is_active) WHERE is_active = true;
```

## Migration Workflow

When you need to change the database:

1. Identify which table(s) need changes
2. Edit the corresponding `.sql` file in `supabase/`
3. Open Supabase SQL Editor
4. Copy-paste the CREATE TABLE statement (uses `IF NOT EXISTS`, safe to re-run)
5. For ALTER TABLE (add column, change type), add the ALTER statement at the bottom
6. Run the SQL
7. Verify in the Dashboard

## ALTER TABLE Examples

```sql
-- Add a new column
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS preview_video_url TEXT;

-- Change column type
ALTER TABLE public.profiles ALTER COLUMN program_type TYPE TEXT USING program_type::TEXT;

-- Add a new index
CREATE INDEX IF NOT EXISTS idx_courses_branch ON public.courses(branch_id);

-- Add a new policy
DO $$ BEGIN
  CREATE POLICY "New policy" ON public.courses FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
```
