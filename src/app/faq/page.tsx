import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbSchema, faqSchema, pageSchema } from '@/lib/seo/json-ld'
import { getFaqs } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'

export default async function FAQPage() {
  const faqItems = await getFaqs()

  const faqData = faqItems.map((item) => ({
    q: item.question,
    a: item.answer,
  }))

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'FAQ', url: '/faq' },
      ])} />
      <JsonLd data={faqSchema(faqData)} />
      <JsonLd data={pageSchema('/faq', 'Frequently Asked Questions | Skillplace Academy', 'Find answers to common questions about admissions, courses, fees, certifications, placement support, online/offline classes, and career guidance at Skillplace Academy.')} />

      <>
        <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface text-on-surface">
          <div className="max-w-3xl mx-auto text-center">
            <nav className="text-caption text-on-surface-variant mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-secondary transition-colors">Home</Link>
              {' / '}
              <span>FAQ</span>
            </nav>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
              Frequently Asked Questions
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Everything you need to know about SkillPlace Academy. Can&apos;t find the answer you&apos;re looking for? Reach out to our team.
            </p>
          </div>
        </section>

        <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low">
          <div className="max-w-3xl mx-auto">
            <div
              className="bg-white rounded-2xl border border-border-subtle overflow-hidden card-shadow"
              role="region"
              aria-label="Frequently asked questions"
            >
              {faqItems.map((item, idx) => (
                <FAQItem key={item.id} question={item.question} answer={item.answer} index={idx} total={faqItems.length} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Still have questions? We&apos;re happy to help.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-secondary text-white font-bold text-label-md hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 group"
              >
                Contact Us
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </section>
      </>
    </>
  )
}

function FAQItem({ question, answer, index, total }: { question: string; answer: string; index: number; total: number }) {
  return (
    <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
      <details className="group">
        <summary
          className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-container-low transition-colors cursor-pointer list-none"
          aria-controls={`faq-detail-${index}`}
        >
          <span className="font-bold text-on-surface pr-4" itemProp="name">{question}</span>
          <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0 transition-transform duration-300 group-open:rotate-180">
            expand_more
          </span>
        </summary>
        <div id={`faq-detail-${index}`} className="px-6 pb-6" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
          <p className="text-body-md text-on-surface-variant" itemProp="text">{answer}</p>
        </div>
      </details>
      {index < total - 1 && (
        <div className="border-t border-border-subtle" />
      )}
    </div>
  )
}
