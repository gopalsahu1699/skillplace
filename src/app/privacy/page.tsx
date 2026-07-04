import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import { createMetadata } from '@/lib/seo/metadata'
import { breadcrumbSchema, pageSchema } from '@/lib/seo/json-ld'

export const metadata: Metadata = createMetadata({
  title: 'Privacy Policy | Skillplace Academy',
  description: 'Privacy policy explaining how Skillplace Academy collects, uses, and protects your personal information. Your data security is our priority.',
  path: '/privacy',
})

export default function PrivacyPage() {
  const lastUpdated = 'June 30, 2026'

  const sections = [
    {
      id: 'information-collect',
      title: '1. Information We Collect',
      content: 'We collect personal information that you voluntarily provide to us when you register on our website, enroll in courses, subscribe to newsletters, or contact us. This may include your name, email address, phone number, academic qualification, payment details, and professional experience.',
    },
    {
      id: 'how-we-use',
      title: '2. How We Use Your Information',
      content: 'We use the collected information to process course enrollments, deliver training programs, facilitate placement services, send important updates and promotional communications, and improve the user experience on our platform.',
    },
    {
      id: 'data-sharing',
      title: '3. Information Sharing & Disclosure',
      content: 'We do not sell or lease your personal information to third parties. We share your information with trusted hiring partners only to facilitate your placement process (such as sending your resume to companies). We may also share data with third-party service providers (like payment processors and hosting services) who assist in running our business.',
    },
    {
      id: 'data-security',
      title: '4. Data Security',
      content: 'We implement robust technical and organizational security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. However, please note that no method of transmission over the internet is 100% secure.',
    },
    {
      id: 'cookies',
      title: '5. Cookies & Tracking',
      content: 'Skillplace Academy uses cookies to enhance your browsing experience, track website performance, and analyze traffic. You can choose to disable cookies in your browser settings, though this may affect the functionality of certain parts of our website.',
    },
    {
      id: 'user-rights',
      title: '6. Your Rights',
      content: 'You have the right to access, update, correct, or request the deletion of your personal information stored with us. To exercise any of these rights, please contact our support team at info@skillplace.com.',
    },
    {
      id: 'changes',
      title: '7. Changes to this Policy',
      content: 'Skillplace Academy reserves the right to update this Privacy Policy at any time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last updated" date.',
    },
  ]

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Privacy Policy', url: '/privacy' },
      ])} />
      <JsonLd data={pageSchema('/privacy', 'Privacy Policy | Skillplace Academy', 'Privacy policy explaining how Skillplace Academy collects, uses, and protects your personal information.')} />

      <div className="bg-slate-50 min-h-screen py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop">

          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1.5 rounded-full">Legal</span>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mt-4 mb-2">Privacy Policy</h1>
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
                At Skillplace Academy, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information.
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
                <h3 className="font-bold text-on-surface mb-2">Have Privacy Concerns?</h3>
                <p className="text-sm text-on-surface-variant mb-4">If you have any questions regarding your data privacy or rights, please reach out to our privacy officer.</p>
                <a
                  href="mailto:info@skillplace.com"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                  Email Support
                </a>
              </div>
            </main>

          </div>

        </div>
      </div>
    </>
  )
}
