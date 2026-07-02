import { getCourses, getTestimonials, getFeaturedTrainingPrograms } from '@/lib/supabase/queries'
import ScrollProgress from '@/components/home/ScrollProgress'
import HeroSection from '@/components/home/HeroSection'
import TrustIndicators from '@/components/home/TrustIndicators'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import StudentJourney from '@/components/home/StudentJourney'
import CareerPathQuiz from '@/components/home/CareerPathQuiz'
import CareerOpportunities from '@/components/home/CareerOpportunities'
import FeaturedPrograms from '@/components/home/FeaturedPrograms'
import JobCoursesSection from '@/components/home/JobCoursesSection'
import MeetMentors from '@/components/home/MeetMentors'
import IndustryPartners from '@/components/home/IndustryPartners'
import TestimonialSection from '@/components/home/TestimonialSection'
import CareerGuidance from '@/components/home/CareerGuidance'
import FAQ from '@/components/home/FAQ'
import FinalCTA from '@/components/home/FinalCTA'

export const dynamic = 'force-dynamic'

const getCoursesList = (dbCourses: string[], fallbacks: string[]) => {
  return dbCourses.length > 0 ? dbCourses : fallbacks
}

export default async function Home() {
  const [courses, testimonials, featuredPrograms] = await Promise.all([
    getCourses(),
    getTestimonials(),
    getFeaturedTrainingPrograms(),
  ])

  // Extract dynamic courses per branch
  const civilCoursesFromDb = courses.filter((c: { branches?: { slug: string } }) => c.branches?.slug === 'civil').slice(0, 6).map((c: { title: string }) => c.title)
  const mechanicalCoursesFromDb = courses.filter((c: { branches?: { slug: string } }) => c.branches?.slug === 'mechanical').slice(0, 4).map((c: { title: string }) => c.title)
  const electricalCoursesFromDb = courses.filter((c: { branches?: { slug: string } }) => c.branches?.slug === 'electrical').slice(0, 4).map((c: { title: string }) => c.title)
  const electronicsCoursesFromDb = courses.filter((c: { branches?: { slug: string } }) => c.branches?.slug === 'electronics').slice(0, 5).map((c: { title: string }) => c.title)
  const softSkillsCoursesFromDb = courses.filter((c: { branches?: { slug: string } }) => !c.branches).slice(0, 4).map((c: { title: string }) => c.title)

  // Fallbacks
  const civilList = getCoursesList(civilCoursesFromDb, ['AutoCAD 2D', 'AutoCAD 3D', 'Revit Architecture', 'Quantity Estimation', 'BOQ Preparation', 'Site Execution'])
  const mechanicalList = getCoursesList(mechanicalCoursesFromDb, ['AutoCAD Mechanical', 'SolidWorks', 'GD&T Basics', 'Production Drawing'])
  const electricalList = getCoursesList(electricalCoursesFromDb, ['LT/HT Systems', 'Panel Design', 'Solar Design', 'PLC Basics'])
  const electronicsList = getCoursesList(electronicsCoursesFromDb, ['PLC Programming', 'HMI', 'SCADA', 'Industrial Sensors', 'VFD'])
  const softSkillsList = getCoursesList(softSkillsCoursesFromDb, ['Resume Building', 'Interview Prep', 'LinkedIn Profile', 'Mock Interviews'])

  // Dynamic Testimonials
  const defaultTestimonials = [
    { id: 't1', student_name: 'Kavita Dubey', course_name: 'Interview Preparation', rating: 5, review: 'Mock interviews boosted my confidence. The personalized feedback was the turning point for me.' },
    { id: 't2', student_name: 'Rahul Verma', course_name: 'AutoCAD 3D', rating: 5, review: 'Excellent course! Got placed in a design firm within 2 months of completing the AutoCAD program.' },
    { id: 't3', student_name: 'Priya Sharma', course_name: 'Revit Architecture', rating: 5, review: 'Best Revit course in Bilaspur. Real project training made all the difference in understanding workflow.' },
  ]
  const testimonialsList = testimonials.length > 0 ? testimonials.slice(0, 3) : defaultTestimonials

  return (
    <>
      <ScrollProgress />

      {/* ═══════════════════════════════════════════
          1. HERO SECTION — ATTENTION
          ═══════════════════════════════════════════ */}
      <HeroSection />

      {/* ═══════════════════════════════════════════
          2. TRUST INDICATORS — TRUST (stat counters)
          ═══════════════════════════════════════════ */}
      {/* <TrustIndicators /> */}

      {/* ═══════════════════════════════════════════
          3. WHY CHOOSE SKILLPLACE — INTEREST (comparison)
          ═══════════════════════════════════════════ */}
      <WhyChooseUs />

      {/* ═══════════════════════════════════════════
          4. STUDENT JOURNEY — DESIRE (reduce uncertainty)
          ═══════════════════════════════════════════ */}
      <StudentJourney />

      {/* ═══════════════════════════════════════════
          5. CAREER PATH QUIZ — ENGAGEMENT (lead capture)
          ═══════════════════════════════════════════ */}
      <CareerPathQuiz />

      {/* ═══════════════════════════════════════════
          6. CAREER OPPORTUNITIES — DESIRE (outcomes + salary)
          ═══════════════════════════════════════════ */}
      <CareerOpportunities />

      {/* ═══════════════════════════════════════════
          7. FEATURED PROGRAMS — DESIRE (premium learning paths)
          ═══════════════════════════════════════════ */}
      <FeaturedPrograms programs={featuredPrograms} />

      {/* ═══════════════════════════════════════════
          8. JOB-ORIENTED COURSES — INTEREST (curriculum detail)
          ═══════════════════════════════════════════ */}
      <JobCoursesSection
        civilList={civilList}
        mechanicalList={mechanicalList}
        electricalList={electricalList}
        // electronicsList={electronicsList}
        softSkillsList={softSkillsList}
      />

      {/* ═══════════════════════════════════════════
          9. MEET OUR MENTORS — PROOF (people trust people)
          ═══════════════════════════════════════════ */}
      <MeetMentors />

      {/* ═══════════════════════════════════════════
          10. INDUSTRY PARTNERS — PROOF (company logos)
          ═══════════════════════════════════════════ */}
      <IndustryPartners />

      {/* ═══════════════════════════════════════════
          11. TESTIMONIALS — PROOF (student stories)
          ═══════════════════════════════════════════ */}
      {/* <TestimonialSection testimonials={testimonialsList} /> */}

      {/* ═══════════════════════════════════════════
          12. CAREER GUIDANCE — DECISION (complete support)
          ═══════════════════════════════════════════ */}
      <CareerGuidance />

      {/* ═══════════════════════════════════════════
          13. FAQ — OBJECTION HANDLING
          ═══════════════════════════════════════════ */}
      <FAQ />

      {/* ═══════════════════════════════════════════
          14. FINAL CTA — ENROLLMENT
          ═══════════════════════════════════════════ */}
      <FinalCTA />
    </>
  )
}
