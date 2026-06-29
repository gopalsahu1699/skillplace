import Link from 'next/link'
import { getCourses, getTestimonials, getTrainingPrograms } from '@/lib/supabase/queries'
import { getProgramImage } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const renderBadge = (type: string) => {
  switch (type) {
    case 'online':
      return (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold text-secondary uppercase tracking-widest">Online</span>
        </div>
      );
    case 'offline':
      return (
        <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold uppercase tracking-widest">Offline</span>
        </div>
      );
    case 'hybrid':
      return (
        <div className="absolute top-4 right-4 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold uppercase tracking-widest">Hybrid</span>
        </div>
      );
    default:
      return (
        <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold uppercase tracking-widest">{type}</span>
        </div>
      );
  }
}

const getCoursesList = (dbCourses: string[], fallbacks: string[]) => {
  return dbCourses.length > 0 ? dbCourses : fallbacks;
}

const displayReview = (review: string) => {
  let clean = review.trim();
  if (clean.startsWith('“') || clean.startsWith('"')) {
    clean = clean.slice(1);
  }
  if (clean.endsWith('”') || clean.endsWith('"')) {
    clean = clean.slice(0, -1);
  }
  return `“${clean}”`;
}

export default async function Home() {
  const [courses, testimonials, trainingPrograms] = await Promise.all([
    getCourses(),
    getTestimonials(),
    getTrainingPrograms(),
  ])

  // Extract dynamic courses per branch
  const civilCoursesFromDb = courses.filter((c: any) => c.branches?.slug === 'civil').slice(0, 6).map((c: any) => c.title);
  const mechanicalCoursesFromDb = courses.filter((c: any) => c.branches?.slug === 'mechanical').slice(0, 4).map((c: any) => c.title);
  const electricalCoursesFromDb = courses.filter((c: any) => c.branches?.slug === 'electrical').slice(0, 4).map((c: any) => c.title);
  const electronicsCoursesFromDb = courses.filter((c: any) => c.branches?.slug === 'electronics').slice(0, 5).map((c: any) => c.title);
  const softSkillsCoursesFromDb = courses.filter((c: any) => !c.branches).slice(0, 4).map((c: any) => c.title);

  // Fallbacks in case database has no entries
  const civilList = getCoursesList(civilCoursesFromDb, ['AutoCAD 2D', 'AutoCAD 3D', 'Revit Architecture', 'Quantity Estimation', 'BOQ Preparation', 'Site Execution']);
  const mechanicalList = getCoursesList(mechanicalCoursesFromDb, ['AutoCAD Mechanical', 'SolidWorks', 'GD&T Basics', 'Production Drawing']);
  const electricalList = getCoursesList(electricalCoursesFromDb, ['LT/HT Systems', 'Panel Design', 'Solar Design', 'PLC Basics']);
  const electronicsList = getCoursesList(electronicsCoursesFromDb, ['PLC Programming', 'HMI', 'SCADA', 'Industrial Sensors', 'VFD']);
  const softSkillsList = getCoursesList(softSkillsCoursesFromDb, ['Resume Building', 'Interview Prep', 'LinkedIn Profile', 'Mock Interviews']);

  // Dynamic Testimonials
  const defaultTestimonials = [
    {
      id: 't1',
      student_name: 'Kavita Dubey',
      course_name: 'Interview Preparation',
      rating: 5,
      review: 'Mock interviews boosted my confidence. The personalized feedback was the turning point for me.'
    },
    {
      id: 't2',
      student_name: 'Rahul Verma',
      course_name: 'AutoCAD 3D',
      rating: 5,
      review: 'Excellent course! Got placed in a design firm within 2 months of completing the AutoCAD program.'
    },
    {
      id: 't3',
      student_name: 'Priya Sharma',
      course_name: 'Revit Architecture',
      rating: 5,
      review: 'Best Revit course in Bilaspur. Real project training made all the difference in understanding workflow.'
    }
  ];

  const testimonialsList = testimonials.length > 0 ? testimonials.slice(0, 3) : defaultTestimonials;

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-surface text-on-surface">
        <div className="relative w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 border border-secondary/30 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-on-surface text-caption font-bold tracking-wider uppercase">Practical Training • Real Projects • Real Careers</span>
            </div>
            <h1 className="font-display-lg text-6xl md:text-7xl mb-4 leading-tight font-extrabold text-primary">Skillplace Academy</h1>
            <h2 className="font-display-lg text-headline-lg md:text-headline-lg text-secondary font-bold mb-6">Learn | Practice | Get Placed</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl">LEARN TODAY – GET HIRED TOMORROW! Become a job-ready engineer in 90 days with our industry-focused curriculum and expert mentorship.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/courses" className="bg-secondary text-white px-8 py-4 rounded-lg font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20">
                Browse Courses<span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link href="/programs" className="border border-outline px-8 py-4 rounded-lg font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-all text-on-surface">
                View Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="relative z-10 -mt-12 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="bg-white dark:bg-surface-container-lowest rounded-2xl shadow-xl p-8 md:p-12 border border-border-subtle grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <span className="font-display-lg text-headline-lg text-secondary mb-2">2000+</span>
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Students Trained</span>
          </div>
          <div className="flex flex-col items-center text-center border-l-0 lg:border-l border-border-subtle">
            <span className="font-display-lg text-headline-lg text-secondary mb-2">100%</span>
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Job Assistance</span>
          </div>
          <div className="flex flex-col items-center text-center border-l-0 lg:border-l border-border-subtle">
            <span className="font-display-lg text-headline-lg text-secondary mb-2">10+</span>
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Industry Mentors</span>
          </div>
          <div className="flex flex-col items-center text-center border-l-0 lg:border-l border-border-subtle">
            <span className="font-display-lg text-headline-lg text-secondary mb-2">{courses.length}+</span>
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Courses</span>
          </div>
        </div>
      </div>

      {/* Our Training Programs */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto" id="programs">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">Our Training Programs</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Choose the learning format that works best for you. Specialized curriculum tailored for mechanical, civil, and electrical engineers.</p>
          </div>
          <Link href="/programs" className="inline-flex items-center gap-2 text-secondary font-bold hover:underline">
            View All Programs
            <span className="material-symbols-outlined">chevron_right</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {trainingPrograms.length > 0 ? (
            trainingPrograms.slice(0, 6).map((p: any) => (
              <Link href={`/programs/${p.slug}`} key={p.id} className="group bg-white rounded-xl border border-border-subtle overflow-hidden card-shadow transition-all duration-300 flex flex-col h-full block">
                <div className="relative aspect-video">
                  <img className="w-full h-full object-cover" alt={p.name} src={getProgramImage(p.branches?.slug)} />
                  {renderBadge(p.program_type)}
                </div>
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-secondary transition-colors line-clamp-2">{p.name}</h3>
                    <ul className="space-y-3 mb-8">
                      {(p.features || []).slice(0, 3).map((f: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-3 text-body-md text-on-surface-variant">
                          <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                          <span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between border-t border-border-subtle pt-6 mt-auto">
                    <div>
                      <span className="block text-caption text-on-surface-variant uppercase font-semibold">Price</span>
                      <span className="text-headline-md font-bold text-primary">₹{p.price?.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-caption text-on-surface-variant uppercase font-semibold">Duration</span>
                      <span className="font-bold">{p.duration_weeks} weeks</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            // Static Default Fallbacks from design/home.html
            <>
              {/* Program 1 */}
              <div className="group bg-white rounded-xl border border-border-subtle overflow-hidden card-shadow transition-all duration-300">
                <div className="relative aspect-video">
                  <img className="w-full h-full object-cover" alt="Civil Engineering" src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-civil-engineering.jpg" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    <span className="text-caption font-bold text-secondary uppercase tracking-widest">Online</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-secondary transition-colors">Civil Engineering Online</h3>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                      Online Course Access
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                      Doubt Sessions
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                      Training Certificate
                    </li>
                  </ul>
                  <div className="flex items-center justify-between border-t border-border-subtle pt-6">
                    <div>
                      <span className="block text-caption text-on-surface-variant uppercase font-semibold">Price</span>
                      <span className="text-headline-md font-bold text-primary">₹29,999</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-caption text-on-surface-variant uppercase font-semibold">Duration</span>
                      <span className="font-bold">24 weeks</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Program 2 */}
              <div className="group bg-white rounded-xl border border-border-subtle overflow-hidden card-shadow transition-all duration-300">
                <div className="relative aspect-video">
                  <img className="w-full h-full object-cover" alt="Mechanical Engineering" src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-mechanical-engineering.jpg" />
                  <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full shadow-sm">
                    <span className="text-caption font-bold uppercase tracking-widest">Offline</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-secondary transition-colors">Mechanical Engineering Offline</h3>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                      100% Job Assistance
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                      Soft Skills Training
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                      Hands-on Practical
                    </li>
                  </ul>
                  <div className="flex items-center justify-between border-t border-border-subtle pt-6">
                    <div>
                      <span className="block text-caption text-on-surface-variant uppercase font-semibold">Price</span>
                      <span className="text-headline-md font-bold text-primary">₹44,999</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-caption text-on-surface-variant uppercase font-semibold">Duration</span>
                      <span className="font-bold">48 weeks</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Program 3 */}
              <div className="group bg-white rounded-xl border border-border-subtle overflow-hidden card-shadow transition-all duration-300">
                <div className="relative aspect-video">
                  <img className="w-full h-full object-cover" alt="Electronics & Automation" src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-electronics-automation.jpg" />
                  <div className="absolute top-4 right-4 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full shadow-sm">
                    <span className="text-caption font-bold uppercase tracking-widest">Hybrid</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-secondary transition-colors">Electronics &amp; Automation</h3>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                      PLC &amp; SCADA Training
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                      Industry Expert Mentorship
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                      Site Visits
                    </li>
                  </ul>
                  <div className="flex items-center justify-between border-t border-border-subtle pt-6">
                    <div>
                      <span className="block text-caption text-on-surface-variant uppercase font-semibold">Price</span>
                      <span className="text-headline-md font-bold text-primary">₹39,999</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-caption text-on-surface-variant uppercase font-semibold">Duration</span>
                      <span className="font-bold">36 weeks</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Job-Oriented Courses (Bento Style) */}
      <section className="py-section-gap bg-surface-container-low">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">Job-Oriented Courses</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Industry-focused curriculum designed for immediate employment. Learn the specific software and skills companies are hiring for.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Civil Bento */}
            <div className="md:col-span-8 bg-white p-8 rounded-2xl border border-border-subtle flex flex-col justify-between card-shadow">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-headline-md text-headline-md text-primary">Civil Engineering</h3>
                  <span className="bg-surface-container-high px-4 py-1 rounded-full text-caption font-bold text-on-secondary-fixed-variant">6 Courses</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                  {civilList.map((item, idx) => (
                    <div className="flex items-center gap-2 text-on-surface-variant" key={idx}>
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span> {item}
                    </div>
                  ))}
                </div>
              </div>
              <Link className="inline-flex items-center gap-2 font-bold text-secondary self-start" href="/courses">
                Explore Civil Courses
                <span className="material-symbols-outlined">trending_flat</span>
              </Link>
            </div>

            {/* Mechanical Bento */}
            <div className="md:col-span-4 bg-primary-container text-white p-8 rounded-2xl flex flex-col justify-between shadow-lg">
              <div>
                <h3 className="font-headline-md text-headline-md mb-6">Mechanical</h3>
                <div className="space-y-4 mb-8">
                  {mechanicalList.map((item, idx) => {
                    const icons = ['settings', 'model_training', 'precision_manufacturing', 'draw', 'settings', 'draw'];
                    return (
                      <p className="text-white/70 flex items-center gap-2" key={idx}>
                        <span className="material-symbols-outlined text-secondary-fixed-dim">{icons[idx] || 'settings'}</span> {item}
                      </p>
                    );
                  })}
                </div>
              </div>
              <Link className="text-secondary-fixed-dim font-bold flex items-center gap-2 group" href="/courses">
                Explore
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>

            {/* Electrical Bento */}
            <div className="md:col-span-4 bg-white p-8 rounded-2xl border border-border-subtle flex flex-col justify-between card-shadow">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-6">Electrical</h3>
                <ul className="space-y-3 mb-8">
                  {electricalList.map((item, idx) => (
                    <li className="text-body-md text-on-surface-variant" key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <Link className="text-secondary font-bold flex items-center gap-2" href="/courses">
                Explore <span className="material-symbols-outlined">open_in_new</span>
              </Link>
            </div>

            {/* Electronics Bento */}
            <div className="md:col-span-5 bg-white p-8 rounded-2xl border border-border-subtle flex flex-col justify-between card-shadow">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-6">Electronics &amp; Automation</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {electronicsList.map((item, idx) => (
                    <span className="bg-surface-container px-3 py-1 rounded text-caption text-on-surface-variant" key={idx}>{item}</span>
                  ))}
                </div>
              </div>
              <Link className="text-secondary font-bold flex items-center gap-2" href="/courses">
                Explore <span className="material-symbols-outlined">trending_flat</span>
              </Link>
            </div>

            {/* Other Bento */}
            <div className="md:col-span-3 bg-secondary text-white p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="font-headline-md text-headline-md mb-4">Soft Skills</h3>
                <p className="text-white/80 text-body-md mb-6">Complete career preparation included in all programs.</p>
              </div>
              <ul className="space-y-1 mb-8 opacity-90 text-caption font-semibold">
                {softSkillsList.map((item, idx) => (
                  <li className="" key={idx}>• {item}</li>
                ))}
              </ul>
              <Link className="text-white font-bold underline decoration-2 underline-offset-4" href="/courses">
                Explore More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-8">Why Choose Skillplace Academy?</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl">We combine practical training with career support to ensure your success in the competitive engineering job market.</p>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>work_history</span>
                </div>
                <h4 className="font-headline-md text-headline-md text-primary">100% Job Assistance</h4>
                <p className="text-body-md text-on-surface-variant">Dedicated placement support and direct recruitment connections for every graduate.</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>menu_book</span>
                </div>
                <h4 className="font-headline-md text-headline-md text-primary">Industry-Focused</h4>
                <p className="text-body-md text-on-surface-variant">Courses designed by active industry experts to meet current market demands.</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>precision_manufacturing</span>
                </div>
                <h4 className="font-headline-md text-headline-md text-primary">Hands-on Practical</h4>
                <p className="text-body-md text-on-surface-variant">70% practical training and only 30% theory to build actual engineering confidence.</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>rocket_launch</span>
                </div>
                <h4 className="font-headline-md text-headline-md text-primary">Real World Projects</h4>
                <p className="text-body-md text-on-surface-variant">Work on live projects with real clients to gain experience before your first job.</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-secondary/5 rounded-3xl -rotate-2"></div>
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-border-subtle">
              <img className="w-full h-auto" alt="Engineering Students" src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/home-engineering-students.jpg" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-6 rounded-xl border border-border-subtle">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-high"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-secondary flex items-center justify-center text-[10px] text-white font-bold">+2k</div>
                  </div>
                  <p className="text-caption font-bold text-on-surface">Trusted by 2,000+ Engineers</p>
                </div>
                <p className="text-body-md text-on-surface-variant">“The hands-on project work gave me the confidence to ace my interview at a top MNC.”</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-section-gap bg-primary-container text-white overflow-hidden relative">
        <div className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center mb-16">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg mb-4">What Our Students Say</h2>
          <p className="font-body-md text-white">Hear from students who transformed their careers at Skillplace Academy</p>
        </div>
        <div className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsList.map((t: any) => (
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:bg-white/15 transition-all flex flex-col justify-between" key={t.id}>
              <div>
                <div className="flex items-center gap-1 text-secondary-fixed-dim mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-tertiary-fixed" style={{ fontVariationSettings: `"${i < (t.rating || 5) ? 'FILL' : 'wght'} ${i < (t.rating || 5) ? '1' : '400'}"` }}>
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-lg text-body-lg mb-10 max-w-2xl text-white">{displayReview(t.review)}</p>
              </div>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-white uppercase">
                  {t.student_name ? t.student_name[0] : 'S'}
                </div>
                <div>
                  <p className="font-bold text-white">{t.student_name}</p>
                  <p className="text-caption uppercase text-white/80">{t.course_name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto bg-secondary rounded-[2rem] p-12 md:p-24 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50"></div>
          <div className="relative z-10">
            <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-white mb-6">Ready to Start Your Career?</h2>
            <p className="font-body-lg text-body-lg text-white mb-10 max-w-2xl">Join thousands of students who have transformed their careers with Skillplace Academy. The best time to start was yesterday. The next best time is now.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link className="bg-white text-secondary px-10 py-4 rounded-xl font-bold text-label-md hover:bg-white/90 transition-all shadow-xl block text-center" href="/courses">Browse Courses</Link>
              <Link className="border border-white text-white px-8 py-4 rounded-lg font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all block text-center" href="/contact">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
