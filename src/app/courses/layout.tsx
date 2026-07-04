import type { Metadata } from 'next'
import { createMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Engineering Courses - AutoCAD, Revit, SolidWorks, PLC | Skillplace Academy',
  description: 'Browse 30+ industry-relevant engineering courses including AutoCAD, Revit Architecture, SolidWorks, PLC Programming, and more. Live projects, expert mentors, certification included.',
  path: '/courses',
  keywords: ['CAD courses', 'BIM training', 'PLC SCADA course', 'engineering software training', 'online engineering classes'],
})

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
