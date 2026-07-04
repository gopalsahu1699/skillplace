import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbSchema, faqSchema, pageSchema } from '@/lib/seo/json-ld'

const allFaqItems = [
  {
    q: 'Who can join SkillPlace Academy?',
    a: 'Anyone who wants to build a career in engineering — fresh graduates, diploma holders, working professionals looking to upskill, or students. No prior experience required for most programs.',
  },
  {
    q: 'Is prior experience required?',
    a: 'No. Our programs are designed for beginners and intermediate learners. We start with fundamentals and build up to advanced topics. All you need is dedication and a willingness to learn.',
  },
  {
    q: 'Will I receive a certificate?',
    a: 'Yes! Every program includes an industry-recognized certificate upon successful completion. Our certificates are valued by companies across India.',
  },
  {
    q: 'Is placement support available?',
    a: 'Absolutely. We provide 100% placement assistance including resume building, interview preparation, mock interviews, and direct connections with hiring partners.',
  },
  {
    q: 'Are classes online or offline?',
    a: 'We offer both. Choose the format that works best for you — online for flexibility, offline for hands-on lab access, or hybrid for the best of both worlds.',
  },
  {
    q: 'Do you provide career guidance?',
    a: 'Yes, career guidance is part of our core offering. From career planning to LinkedIn optimization, freelancing guidance to startup mentorship — we cover it all.',
  },
  {
    q: 'What engineering branches do you cover?',
    a: 'We offer programs in Civil Engineering, Mechanical Engineering, Electrical Engineering, and Electronics & Automation. Each program is designed with industry-relevant tools and real-world projects.',
  },
  {
    q: 'How long are the programs?',
    a: 'Program duration varies by branch and format — typically between 12 to 48 weeks. Part-time and weekend options are also available for working professionals.',
  },
  {
    q: 'What is the fee structure?',
    a: 'Our fees are affordable and vary by program. We also offer EMI options and scholarships for deserving students. Check our Programs page for current pricing.',
  },
  {
    q: 'Can I attend a demo class before enrolling?',
    a: 'Yes! We offer free demo classes for all programs. You can schedule a demo from our website or contact our admissions team. We want you to feel confident before you commit.',
  },
]

export default function FAQPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'FAQ', url: '/faq' },
      ])} />
      <JsonLd data={faqSchema(allFaqItems)} />
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
              {allFaqItems.map((item, idx) => (
                <FAQItem key={idx} question={item.q} answer={item.a} index={idx} />
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

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
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
      {index < allFaqItems.length - 1 && (
        <div className="border-t border-border-subtle" />
      )}
    </div>
  )
}
