import Link from 'next/link'
import { getCourses, getTestimonials, getTrainingPrograms } from '@/lib/supabase/queries'
import ScrollProgress from '@/components/home/ScrollProgress'
import TrustIndicators from '@/components/home/TrustIndicators'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import StudentJourney from '@/components/home/StudentJourney'
import CareerOpportunities from '@/components/home/CareerOpportunities'
import CareerGuidance from '@/components/home/CareerGuidance'
import IndustryPartners from '@/components/home/IndustryPartners'
import MeetMentors from '@/components/home/MeetMentors'
import TestimonialSection from '@/components/home/TestimonialSection'
import FAQ from '@/components/home/FAQ'
import FinalCTA from '@/components/home/FinalCTA'
import OurTrainingProgram from '@/components/home/OurTrainingProgram'
import HeroSection from '@/components/home/HeroSection'
import CareerPathQuiz from '@/components/home/CareerPathQuiz'
import ConsultationBooking from '@/components/home/ConsultationBooking'
import JobCoursesSection from '@/components/home/JobCoursesSection'

export const dynamic = 'force-dynamic'

const getCoursesList = (dbCourses: string[], fallbacks: string[]) => {
  return dbCourses.length > 0 ? dbCourses : fallbacks
}

export default async function Home() {
  const [courses, testimonials, trainingPrograms] = await Promise.all([
    getCourses(),
    getTestimonials(),
    getTrainingPrograms(),
  ])

  // Extract dynamic courses per branch
  const civilCoursesFromDb = courses.filter((c: any) => c.branches?.slug === 'civil').slice(0, 6).map((c: any) => c.title)
  const mechanicalCoursesFromDb = courses.filter((c: any) => c.branches?.slug === 'mechanical').slice(0, 4).map((c: any) => c.title)
  const electricalCoursesFromDb = courses.filter((c: any) => c.branches?.slug === 'electrical').slice(0, 4).map((c: any) => c.title)
  const electronicsCoursesFromDb = courses.filter((c: any) => c.branches?.slug === 'electronics').slice(0, 5).map((c: any) => c.title)
  const softSkillsCoursesFromDb = courses.filter((c: any) => !c.branches).slice(0, 4).map((c: any) => c.title)

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
          1. HERO SECTION 
          ═══════════════════════════════════════════ */}
      <HeroSection />



      {/* ═══════════════════════════════════════════
          3. WHY CHOOSE SKILLPLACE ACADEMY
          ═══════════════════════════════════════════ */}
      <WhyChooseUs />

            {/* ═══════════════════════════════════════════
          2. TRUST INDICATORS
          ═══════════════════════════════════════════ */}
      <TrustIndicators />

    

      {/* ═══════════════════════════════════════════
          4. STUDENT JOURNEY TIMELINE
          ═══════════════════════════════════════════ */}
      <StudentJourney />
    {/* ═══════════════════════════════════════════
          3.5 INTERACTIVE CAREER PATH FINDER QUIZ
          ═══════════════════════════════════════════ */}
      <CareerPathQuiz />

      {/* ═══════════════════════════════════════════
          6. CAREER OPPORTUNITIES
          ═══════════════════════════════════════════ */}
      <CareerOpportunities />

    

      {/* ═══════════════════════════════════════════
          7. CAREER GUIDANCE
          ═══════════════════════════════════════════ */}
      <CareerGuidance />

      {/* ═══════════════════════════════════════════
          7.5 BOOK A FREE CAREER CONSULTATION
          ═══════════════════════════════════════════ */}
      <ConsultationBooking />

      {/* ═══════════════════════════════════════════
          8. OUR TRAINING PROGRAMS 
          ═══════════════════════════════════════════ */}
    <OurTrainingProgram trainingPrograms={trainingPrograms} />
  
      {/* ═══════════════════════════════════════════
          9. JOB-ORIENTED COURSES (Desktop Bento & Mobile Tabs)
          ═══════════════════════════════════════════ */}
      <JobCoursesSection
        civilList={civilList}
        mechanicalList={mechanicalList}
        electricalList={electricalList}
        electronicsList={electronicsList}
        softSkillsList={softSkillsList}
      />

      {/* ═══════════════════════════════════════════
          10. INDUSTRY PARTNERS
          ═══════════════════════════════════════════ */}
      <IndustryPartners />

      {/* ═══════════════════════════════════════════
          11. MEET OUR MENTORS
          ═══════════════════════════════════════════ */}
      <MeetMentors />

      {/* ═══════════════════════════════════════════
          12. STUDENT SUCCESS
          ═══════════════════════════════════════════ */}
      {/* <StudentSuccess /> */}

      {/* ═══════════════════════════════════════════
          13. WHY STUDENTS TRUST US (Stats)
          ═══════════════════════════════════════════ */}
      {/* <WhyTrustUs /> */}

      {/* ═══════════════════════════════════════════
          14. TESTIMONIALS
          ═══════════════════════════════════════════ */}
   <TestimonialSection testimonials={testimonialsList} />

      {/* ═══════════════════════════════════════════
          15. FAQ
          ═══════════════════════════════════════════ */}
      <FAQ />

      {/* ═══════════════════════════════════════════
          16. FINAL CTA
          ═══════════════════════════════════════════ */}
      <FinalCTA />
    </>
  )
}
