import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import { createMetadata } from '@/lib/seo/metadata'
import { breadcrumbSchema, pageSchema } from '@/lib/seo/json-ld'

export const metadata: Metadata = createMetadata({
  title: 'Terms and Conditions | Skillplace Academy',
  description: 'Terms and conditions governing enrollment, fees, refunds, placement assistance, and use of Skillplace Academy\'s educational services and platform.',
  path: '/terms',
})

export default function TermsPage() {
  const lastUpdated = 'June 30, 2026'

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: 'By accessing or using the Skillplace Academy website, enrolling in our training programs, or utilizing our placement assistance services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.',
    },
    {
      id: 'services',
      title: '2. Description of Services',
      content: 'Skillplace Academy provides industry-oriented technical training, certifications, and career placement assistance in engineering domains including Civil, Mechanical, and Electrical/Electronics engineering. We reserve the right to modify, suspend, or discontinue any course or service at any time without prior notice.',
    },
    {
      id: 'enrollment',
      title: '3. Enrollment & Fees',
      content: 'To enroll in a course, you must provide accurate and complete registration information. All course fees must be paid in accordance with the payment schedule agreed upon during enrollment. Failure to make timely payments may result in suspension of course access and placement assistance.',
    },
    {
      id: 'refunds',
      title: '4. Refund & Cancellation Policy',
      content: 'Fees paid for Skillplace Academy courses are non-refundable once the course has commenced or access to learning materials has been granted. Cancellations before the start of a batch may be eligible for a partial refund or transfer to a future batch, subject to approval by the administration.',
    },
    {
      id: 'intellectual-property',
      title: '5. Intellectual Property',
      content: 'All course materials, including video lectures, PDFs, project templates, source code, and design documents provided by Skillplace Academy, are our exclusive intellectual property. They are licensed to you solely for personal, non-commercial educational use. Copying, distributing, or sharing these materials is strictly prohibited.',
    },
    {
      id: 'placements',
      title: '6. Placement Assistance',
      content: 'Our "100% Placement Assistance" program includes resume building, mock interviews, and providing interview opportunities with our hiring partners. While we work diligently to secure interviews for eligible students who complete their coursework, Skillplace Academy does not guarantee employment. Ultimate hiring decisions rest solely with the partner companies.',
    },
    {
      id: 'conduct',
      title: '7. Student Conduct',
      content: 'Students are expected to maintain professional conduct during all classes, mock interviews, and recruitment drives. Any form of academic dishonesty, harassment, or disruption of training sessions may result in immediate termination of your enrollment without a refund.',
    },
    {
      id: 'governing-law',
      title: '8. Governing Law',
      content: 'These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts located in Bilaspur, Chhattisgarh.',
    },
  ]

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Terms & Conditions', url: '/terms' },
      ])} />
      <JsonLd data={pageSchema('/terms', 'Terms and Conditions | Skillplace Academy', 'Terms and conditions governing enrollment, fees, refunds, placement assistance, and use of Skillplace Academy\'s educational services.')} />

      <div className="bg-slate-50 min-h-screen py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop">

          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1.5 rounded-full">Legal</span>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mt-4 mb-2">Terms & Conditions</h1>
            <p className="text-sm text-on-surface-variant">Last updated: {lastUpdated}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            <aside className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-24 bg-white p-6 rounded-2xl border border-border-subtle shadow-sm">
                <h3 className="font-bold text-sm text-primary uppercase tracking-wider mb-4">Navigation</h3>
                <nav className="space-y-3">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block text-xs font-semibold text-on-surface-variant hover:text-secondary transition-colors"
                    >
                      {section.title.split('. ')[1]}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <main className="lg:col-span-3 bg-white p-8 md:p-12 rounded-3xl border border-border-subtle shadow-sm">
              <p className="text-body-md text-on-surface-variant mb-8">
                Welcome to Skillplace Academy. Please review the following terms and conditions that govern your use of our website, courses, and educational services.
              </p>

              <div className="space-y-8">
                {sections.map((section) => (
                  <div key={section.id} id={section.id} className="scroll-mt-24">
                    <h2 className="font-headline-md text-headline-md text-primary mb-3">{section.title}</h2>
                    <p className="text-body-md text-on-surface-variant leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-surface-container-low rounded-2xl border border-border-subtle text-center">
                <h3 className="font-bold text-on-surface mb-2">Questions about our Terms?</h3>
                <p className="text-sm text-on-surface-variant mb-4">Our administrative team is here to clarify any questions you might have.</p>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                  Contact Administration
                </Link>
              </div>
            </main>

          </div>

        </div>
      </div>
    </>
  )
}
