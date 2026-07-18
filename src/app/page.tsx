import type { Metadata } from 'next'
import { getCourses, getTestimonials, getFeaturedTrainingPrograms, getFaqs } from '@/lib/supabase/queries'
import ScrollProgress from '@/components/home/ScrollProgress'
import HeroSection from '@/components/home/HeroSection'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import StudentJourney from '@/components/home/StudentJourney'
import CareerPathQuiz from '@/components/home/CareerPathQuiz'
import CareerOpportunities from '@/components/home/CareerOpportunities'
import FeaturedPrograms from '@/components/home/FeaturedPrograms'
import JobCoursesSection from '@/components/home/JobCoursesSection'
import MeetMentors from '@/components/home/MeetMentors'
import IndustryPartners from '@/components/home/IndustryPartners'
import CareerGuidance from '@/components/home/CareerGuidance'
import FAQ from '@/components/home/FAQ'
import FinalCTA from '@/components/home/FinalCTA'
import JsonLd from '@/components/seo/JsonLd'
import { createMetadata } from '@/lib/seo/metadata'
import { breadcrumbSchema, speakableSchema, howToSchema, pageSchema, faqSchema } from '@/lib/seo/json-ld'

export const metadata: Metadata = createMetadata({
  title: 'Skillplace Academy - Build Skills. Build Career. | Engineering Training in Bilaspur',
  description: 'Skillplace Academy is the best engineering institute in Bilaspur, Chhattisgarh offering Civil, Electrical & Mechanical engineering training with 100% placement assistance. Learn AutoCAD, Revit, SolidWorks, PLC and more.',
  path: '/',
  keywords: [
    'SkillPlace Academy Bilaspur',
    'Engineering Training Bilaspur',
    'best engineering academy Bilaspur',
    'skill development center Chhattisgarh',
    'job oriented training programs',
    'engineering practical training',
    'placement assistance Bilaspur',
  ],
})

export const dynamic = 'force-dynamic'

const getCoursesList = (dbCourses: string[], fallbacks: string[]) => {
  return dbCourses.length > 0 ? dbCourses : fallbacks
}

export default async function Home() {
  const [courses, featuredPrograms, faqItems] = await Promise.all([
    getCourses(),
    getFeaturedTrainingPrograms(),
    getFaqs(),
  ])

  const civilCoursesFromDb = courses.filter((c: { branches?: { slug: string } }) => c.branches?.slug === 'civil').slice(0, 6).map((c: { title: string }) => c.title)
  const mechanicalCoursesFromDb = courses.filter((c: { branches?: { slug: string } }) => c.branches?.slug === 'mechanical').slice(0, 4).map((c: { title: string }) => c.title)
  const electricalCoursesFromDb = courses.filter((c: { branches?: { slug: string } }) => c.branches?.slug === 'electrical').slice(0, 4).map((c: { title: string }) => c.title)
  const softSkillsCoursesFromDb = courses.filter((c: { branches?: { slug: string } }) => !c.branches).slice(0, 4).map((c: { title: string }) => c.title)

  const civilList = getCoursesList(civilCoursesFromDb, ['AutoCAD 2D', 'AutoCAD 3D', 'Revit Architecture', 'Quantity Estimation', 'BOQ Preparation', 'Site Execution'])
  const mechanicalList = getCoursesList(mechanicalCoursesFromDb, ['AutoCAD Mechanical', 'SolidWorks', 'GD&T Basics', 'Production Drawing'])
  const electricalList = getCoursesList(electricalCoursesFromDb, ['LT/HT Systems', 'Panel Design', 'Solar Design', 'PLC Basics'])
  const softSkillsList = getCoursesList(softSkillsCoursesFromDb, ['Resume Building', 'Interview Prep', 'LinkedIn Profile', 'Mock Interviews'])

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'Home', url: '/' }])} />
      <JsonLd data={speakableSchema('/', ['.font-display-lg', '.font-headline-lg'])} />
      <JsonLd data={howToSchema([
        { name: 'Choose Your Program', text: 'Browse our engineering programs in Civil, Mechanical, Electrical, or Electronics.', url: '/programs' },
        { name: 'Enroll Online', text: 'Complete your enrollment with our simple online process.', url: '/register' },
        { name: 'Start Learning', text: 'Access practical training with industry experts and real-world projects.' },
        { name: 'Get Placed', text: 'Receive 100% placement assistance with 200+ hiring partners.' },
      ])} />
      <JsonLd data={pageSchema('/', 'Skillplace Academy - Build Skills. Build Career. | Engineering Training in Bilaspur', 'India\'s leading engineering skill development academy in Bilaspur, Chhattisgarh.')} />
      {faqItems.length > 0 && <JsonLd data={faqSchema(faqItems.map(f => ({ q: f.question, a: f.answer })))} />}

      <ScrollProgress />

      <HeroSection />

      <WhyChooseUs />

      <StudentJourney />

      <CareerPathQuiz />

      <CareerOpportunities />

      <FeaturedPrograms programs={featuredPrograms} />

      {/* <JobCoursesSection
        civilList={civilList}
        mechanicalList={mechanicalList}
        electricalList={electricalList}
        softSkillsList={softSkillsList}
      /> */}

      <MeetMentors />

      <IndustryPartners />

      <CareerGuidance />

      <FAQ />

      <FinalCTA />
    </>
  )
}
