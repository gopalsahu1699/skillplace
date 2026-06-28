# Learning System — Skillplace Academy

## Two Business Flows

### Flow 1: Individual Courses
- Sold directly via `/courses/[slug]`
- Student browses catalog → clicks course → enrolls → learns
- Enrollment creates record in `enrollments` table

### Flow 2: Training Programs
- Bundled courses per branch
- Enrolled via `/programs/[slug]/enroll`
- Program = ordered list of courses (via `program_courses`)
- Includes: soft skills, resume building, interview prep, placement support
- Types: online, offline, hybrid

## Learning Journey

```
Enrollment → Course Access → Lesson Progress → Test → Certificate
```

### Course Structure
```
Program
├── Course 1
│   ├── Module 1
│   │   ├── Lesson 1 (video)
│   │   ├── Lesson 2 (video)
│   │   └── Lesson 3 (video)
│   ├── Module 2
│   │   └── ...
│   └── Test
├── Course 2
│   └── ...
└── Soft Skills / Resume / Interview Prep
```

### Progress Tracking
- `course_progress` table tracks overall course completion
- `lesson_progress` table tracks individual lesson completion
- Progress percentage calculated from completed lessons / total lessons

### Tests
- Each course can have tests
- `tests` table stores test metadata
- `test_questions` stores MCQ questions with JSONB options
- `test_attempts` stores student attempts + scores
- Passing score configurable per test (default 60%)

### Certificates
- Issued on course/program completion
- Stored in `certificates` table
- Unique certificate number (format: SP-YYYY-NNNNN)
- PDF generation via `lib/certificate-templates.ts`
- Types: completion, internship, project, training

## Enrollment States
```
pending → active → completed
         ↘ expired
```

## Course Levels
- beginner
- intermediate
- advanced

## Program Types
- online: 100% online, doubt sessions, placement support
- offline: Hands-on practical, site visits, 100% job assistance
- hybrid: Online theory + offline practical sessions

## Branch Specialization
| Branch | Focus |
|--------|-------|
| Civil | AutoCAD, Revit, Quantity Estimation, BOQ, Site Execution |
| Mechanical | AutoCAD, SolidWorks, GD&T, Production Drawing |
| Electrical | AutoCAD Electrical, LT/HT, Panel Design, Solar |
| Electronics | PLC, HMI, SCADA, Sensors, VFD, Industrial Networking |

## Career Support
- Resume Building course
- Interview Preparation course
- Mock Interviews (1-on-1 sessions)
- LinkedIn Profile optimization
- Communication Skills training
- Placements page showcasing placed students
