# Skillplace Academy - Supabase Database Schema

Individual SQL files for each table. Each file contains:
- `CREATE TABLE IF NOT EXISTS` statement
- All RLS policies
- No data inserted

## Folder: `supabase/`

```
supabase/
├── profiles.sql          (extends auth.users)
├── employees.sql        (staff - instructors, counselors)
├── branches.sql         (engineering disciplines)
├── courses.sql          (course catalog)
├── modules.sql          (course sections)
├── lessons.sql          (individual lessons)
├── training_programs.sql (bundled programs)
├── program_courses.sql   (program ↔ course junction)
├── enrollments.sql       (student program enrollments)
├── tests.sql             (course assess/test)
├── test_questions.sql    (MCQ questions)
├── test_attempts.sql     (student attempts)
├── certificates.sql      (issued certificates)
├── coupons.sql           (promo codes)
├── leads.sql             (website inquiries)
├── testimonials.sql      (student reviews)
├── user_sessions.sql     (active sessions)
├── notifications.sql      (user notifications)
├── course_progress.sql    (progress tracking)
├── live_classes.sql       (scheduled classes)
└── student_projects.sql   (student portfolio)
```

## Order of Execution

Run tables in this order due to foreign key dependencies:

1. branches.sql        (no dependencies)
2. profiles.sql        (depends on auth.users)
3. employees.sql       (no dependencies)
4. courses.sql         (depends on branches)
5. modules.sql         (depends on courses)
6. lessons.sql         (depends on modules)
7. training_programs.sql    (depends on branches)
8. program_courses.sql     (depends on training_programs, courses)
9. enrollments.sql     (depends on profiles, training_programs, branches)
10. tests.sql           (depends on courses)
11. test_questions.sql  (depends on tests)
12. test_attempts.sql   (depends on profiles, tests)
13. certificates.sql    (depends on profiles, courses)
14. coupons.sql         (no dependencies)
15. leads.sql           (no dependencies)
16. testimonials.sql    (no dependencies)
17. user_sessions.sql   (depends on profiles)
18. notifications.sql    (depends on profiles)
19. course_progress.sql  (depends on profiles, courses)
20. live_classes.sql     (depends on courses)
21. student_projects.sql (depends on profiles, courses)
