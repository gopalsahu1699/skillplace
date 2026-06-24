# Skillplace Academy — Home Page Update Brief

## Goal
Redesign the Home page (`src/app/page.tsx`) to be a high-converting academy landing page. The goal is MAXIMUM student admissions. Use the existing course data from `course details.txt`. Keep it simple, persuasive, and focused on getting students to enroll.

## Project Location
- Real path: `D:\web software developement\skillplace\skillplace`
- Junction: `C:\auto_skillplace\skillplace` (use this for all operations)
- LIGHT THEME: white bg, blue-600 primary, slate text
- Use ONLY Tailwind CSS classes — no inline styles, no CSS-in-JS

## Current Home Page Structure
The current `src/app/page.tsx` renders these sections in order:
1. HeroSection
2. StatsSection
3. CoursesSection
4. PlacementSection
5. TestimonialsSection
6. CTA section

## Tasks

### 1. Rewrite Home Page — `src/app/page.tsx`

Replace the entire home page with a new academy-focused layout. Keep importing existing components where possible, but rewrite the main page.tsx to include ALL of the following sections in order:

**Section 1: Hero Section**
- Big bold headline: "skillplace ACADEMY"
- Sub-headline: "Learn | Practice | Get Placed"
- Main offer text: "LEARN TODAY – GET HIRED TOMORROW!"
- Supporting text: "Practical Training • Real Projects • Real Careers"
- Location badge: "📍 Bilaspur, Chhattisgarh"
- Two CTA buttons: "Enroll Now" (links to /courses) and "Free Career Counseling" (links to /contact)
- Show 3 program types as small badges/tags below buttons: "Online", "Offline", "Hybrid"

**Section 2: Stats/Trust Bar**
- 4 stats in a row: "2000+ Students Trained", "100% Job Assistance", "10+ Industry Mentors", "22+ Courses"
- Use blue-600 on white background

**Section 3: Programs Section (NEW - Key for conversion)**
- Title: "Our Programs"
- Three cards side by side: Online Program, Offline Program, Hybrid Program
- Each card shows:
  - Program name with icon (Laptop for Online, Users for Offline, Globe for Hybrid)
  - List of features with checkmarks
  - Highlight the Offline Program card (border-primary, "Most Popular" badge)
- Features for each:
  - Online: Course access, Online doubt sessions, Training certificate, Project completion certificate, Resume building, Career guidance, Lifetime recording access, Interview preparation
  - Offline: 100% Job assistance, Soft skills training, Doubt sessions, Live offline classes with recorded video, Site visits, Industry expert mentorship, Internship certificate, Training completion certificate, 2 project certificates, Year-gap solution, Resume building, Lifetime recording access, Interview preparation
  - Hybrid: Online course access, Training completion certificate, Industry expert mentorship, Site visits, 2 Project completion certificates, Job assistance (final-year students), Access to both online and offline resources, Resume building, Career guidance, Lifetime recording access, Interview preparation

**Section 4: Courses Section**
- Title: "Job-Oriented Courses"
- Subtitle: "Industry-focused curriculum designed for immediate employment"
- Show 4 department cards in a grid:
  1. Civil Engineering — AutoCAD Civil, Quantity Survey, Billing & Estimation, BOQ Preparation, Excel for Engineers, Site Execution Basics
  2. Mechanical Engineering — AutoCAD Mechanical, SolidWorks, GD&T, Industrial Drawing, Design Basics, NC Programming
  3. Electrical Engineering — AutoCAD Electrical, Estimation & Costing, Panel Designing, Electrical Basics, Project Work
  4. Electronics — PCB Design Basics, Embedded Systems, Industrial Electronics, Microcontroller Basics, Project Work
- Each card: department name with icon, course count, list of courses, "Explore →" link
- Below grid: "View All 22+ Courses →" button linking to /courses

**Section 5: Why Choose Us Section**
- Title: "Why Choose Skillplace Academy?"
- 4 cards in a row:
  1. Briefcase icon — "100% Job Assistance" — "Dedicated placement support for every student"
  2. Target icon — "Industry-Focused Curriculum" — "Courses designed by industry experts"
  3. Wrench icon — "Hands-on Practical Training" — "70% practical, 30% theory"
  4. Award icon — "Real World Projects" — "Work on live projects with real clients"

**Section 6: Target Students Section**
- Title: "Who Should Join?"
- 4 cards:
  1. GraduationCap icon — "Diploma Students" — "Kickstart your career with practical skills"
  2. BookOpen icon — "B.Tech Final Year" — "Bridge the gap between college and industry"
  3. Users icon — "Passed Out Students" — "Get job-ready with real project experience"
  4. Briefcase icon — "Working Professionals" — "Upskill and switch to better opportunities"

**Section 7: Features Section (with icons)**
- Title: "What We Offer"
- Grid of 7 items with icons:
  - 100% Job Assistance (Briefcase)
  - Practical Training (Target)
  - Live Projects (Wrench)
  - Industry Mentor Guidance (Users)
  - Soft Skills Training (MessageSquare)
  - Interview Preparation (FileText)
  - Placement Assistance (Handshake)

**Section 8: Certificates Section**
- Title: "Certificates You'll Receive"
- 3 certificate cards:
  1. Course Completion Certificate
  2. Project Completion Certificate (2 Live Projects)
  3. Industrial Training Certificate (From Company)

**Section 9: Industry Experts Section**
- Title: "Learn From Industry Experts"
- Two highlight cards:
  - "10+ Industry Mentors" — "Learn from experienced professionals"
  - "Extra Mentor Sessions" — "Personalized guidance and support"

**Section 10: Admissions Open Banner**
- Large banner with urgency: "🎓 Admissions Open — Limited Seats!"
- Text: "Join the next batch of successful engineers. Enroll today and start your journey to a better career."
- CTA: "Enroll Now" button linking to /courses

**Section 11: Contact / Footer CTA**
- Title: "Get In Touch"
- Two cards:
  - Phone/WhatsApp: 7987814261, 8085782471
  - Location: Bilaspur, Chhattisgarh
- Sponsors line: "Sponsored by Autommensor Automation Pvt. Ltd. | Industry Partner: himanshu construction"

**Section 12: Final CTA**
- Blue background section
- "Ready to Start Your Career?"
- Browse Courses + Contact Us buttons

### 2. Update Navbar — `src/components/layout/Navbar.tsx`
- Keep existing links but ensure the order is: Home, Courses, Placements, About, Contact
- Make sure "Academy" link is REMOVED (if it was added by previous run)

### 3. Update Courses Page — `src/app/courses/page.tsx`
- Keep the existing course data (22 courses from previous update)
- Update the page header to say: "Job-Oriented Courses at Skillplace Academy"
- Subtitle: "Explore 22+ industry-focused courses across Civil, Mechanical, Electrical, and Electronics engineering"

### 4. Update About Page — `src/app/about/page.tsx`
- Update to reflect Skillplace Academy branding
- Add: "📍 Bilaspur, Chhattisgarh" location
- Add: "Sponsored by Autommensor Automation Pvt. Ltd."
- Add: "Industry Partner: himanshu construction"
- Keep the existing mission/vision/why-choose-us content but add academy-specific details

### 5. Update Contact Page — `src/app/contact/page.tsx`
- Ensure phone numbers are: 7987814261, 8085782471
- Ensure location is: Bilaspur, Chhattisgarh
- Add WhatsApp as contact method label

## Design Guidelines
- LIGHT THEME: white backgrounds, blue-600 primary (#2563eb), slate/gray text
- Use existing UI components from `src/components/ui/` (Button, Card, Badge, etc.)
- Use lucide-react icons
- Responsive: mobile-first with sm:/md:/lg: breakpoints
- Consistent spacing: py-16 for sections, max-w-7xl container
- Make it feel URGENT and ACTION-oriented — this is a conversion page
- Use social proof (stats, testimonials) prominently
- Programs section should be visually prominent — this is the unique selling point

## DO NOT
- Do NOT run git push or any git remote commands
- Do NOT create any new pages
- Do NOT modify the database schema
- Do NOT add new dependencies
- Do NOT modify admin/student dashboards
- Do NOT change the Course type interface
- Do NOT create the /academy page — all content goes on existing pages

## After Completion
- Run `npx tsc --noEmit` to verify no TypeScript errors
- Run `git log --oneline -3` to confirm no unintended commits
