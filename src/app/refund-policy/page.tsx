import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import { createMetadata } from '@/lib/seo/metadata'
import { breadcrumbSchema, pageSchema } from '@/lib/seo/json-ld'

export const metadata: Metadata = createMetadata({
  title: 'Cancellation & Refund Policy | Skillplace Academy',
  description: 'Understand Skillplace Academy\'s cancellation and refund policy for course fees, eligibility criteria, timelines, and the refund request process.',
  path: '/refund-policy',
})

export default function RefundPolicyPage() {
  const lastUpdated = 'July 5, 2026'

  const sections = [
    {
      id: 'overview',
      title: '1. Policy Overview',
      content: 'This Cancellation & Refund Policy governs all fee payments made to Skillplace Academy for enrollment in our training programs and courses. By completing a payment, you agree to the terms outlined below. We recommend reading this policy carefully before enrolling.',
    },
    {
      id: 'cancellation-before-start',
      title: '2. Cancellation Before Course Start',
      content: 'If you cancel your enrollment before the scheduled start date of the batch, you are eligible for a full refund of the fees paid, minus a nominal administrative processing fee of ₹500. Requests must be submitted in writing to skillplaceacademy@gmail.com at least 5 business days before the batch commencement date. Refunds under this clause will be processed within 10–15 business days from the date of cancellation approval.',
    },
    {
      id: 'cancellation-after-start',
      title: '3. Cancellation After Course Start',
      content: 'Cancellation requests received after the course has commenced are evaluated on a case-by-case basis. Refund eligibility depends on the amount of course content accessed:\n\n- Within 3 days of start: 75% refund of fees paid\n- Within 7 days of start: 50% refund of fees paid\n- After 7 days: No refund is applicable\n\nAccess to the course platform and learning materials will be revoked upon cancellation approval.',
    },
    {
      id: 'non-refundable',
      title: '4. Non-Refundable Fees',
      content: 'The following fees and charges are non-refundable under any circumstances:\n\n- Administrative processing fees\n- Certification and examination fees (if applicable)\n- Fees for courses marked as "non-refundable" or "limited-seat" at the time of enrollment\n- Any discounts or promotional offers applied to the original fee\n\nStudents enrolled in programs explicitly stated as non-refundable at checkout will not be eligible for any refund, regardless of the cancellation timeline.',
    },
    {
      id: 'transfer-policy',
      title: '5. Batch Transfer Policy',
      content: 'In lieu of cancellation, students may request a one-time transfer to a future batch of the same course at no additional cost, provided the request is made within 7 days of the original batch start date. Batch transfers are subject to seat availability in the target batch. Once a transfer is approved, the refund eligibility period resets based on the new batch start date. Only one transfer is permitted per enrollment.',
    },
    {
      id: 'placement-fees',
      title: '6. Placement Assistance Fees',
      content: 'Fees paid exclusively for placement assistance services (where offered as a separate service) are non-refundable once the student has attended their first mock interview or resume workshop, whichever occurs first. If placement services have not yet commenced, a pro-rata refund may be considered at the discretion of the administration.',
    },
    {
      id: 'how-to-request',
      title: '7. How to Request a Refund',
      content: 'To initiate a cancellation or refund request, please follow these steps:\n\n1. Send an email to skillplaceacademy@gmail.com from your registered email address with the subject line "Cancellation Request – [Your Full Name] – [Course Name]" \n2. Include your registered phone number and order/transaction ID in the email body\n3. Our accounts team will review your request and respond within 3–5 business days\n4. If approved, the refund will be processed to the original payment method within 10–15 business days\n\nRefunds for payments made via credit/debit card or UPI will be credited to the same card or UPI account. Bank transfer refunds may require additional processing time.',
    },
    {
      id: 'chargebacks',
      title: '8. Chargebacks & Disputes',
      content: 'If you believe a charge has been made in error, please contact our support team directly before initiating a chargeback with your bank or payment provider. Unnecessary chargebacks may result in permanent account suspension and loss of access to all enrolled courses. We are committed to resolving all billing disputes amicably and promptly.',
    },
    {
      id: 'exceptions',
      title: '9. Exceptional Circumstances',
      content: 'Skillplace Academy understands that unforeseen circumstances such as medical emergencies, bereavement, or other exceptional events may prevent a student from continuing their coursework. In such cases, we encourage you to contact us with supporting documentation. Refunds or transfers outside the standard policy may be considered at the sole discretion of the management.',
    },
    {
      id: 'contact',
      title: '10. Contact Us',
      content: 'For any questions, concerns, or clarification regarding this Cancellation & Refund Policy, please reach out to:\n\nEmail: skillplaceacademy@gmail.com\nPhone: +91-7987814261\nAddress: Skillplace Academy, Bilaspur, Chhattisgarh, India\n\nWe aim to respond to all refund-related queries within 3–5 business days.',
    },
  ]

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Cancellation & Refund Policy', url: '/refund-policy' },
      ])} />
      <JsonLd data={pageSchema('/refund-policy', 'Cancellation & Refund Policy | Skillplace Academy', 'Skillplace Academy\'s cancellation and refund policy covering course fee refunds, eligibility criteria, timelines, and the refund request process.')} />

      <div className="bg-slate-50 min-h-screen py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop">

          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1.5 rounded-full">Policy</span>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mt-4 mb-2">Cancellation & Refund Policy</h1>
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
                At Skillplace Academy, we strive to ensure your complete satisfaction with our training programs. However, we understand that circumstances may change. This policy outlines the conditions under which cancellations and refunds are processed.
              </p>

              <div className="space-y-8">
                {sections.map((section) => (
                  <div key={section.id} id={section.id} className="scroll-mt-24">
                    <h2 className="font-headline-md text-headline-md text-primary mb-3">{section.title}</h2>
                    {section.content.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">{paragraph}</p>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-surface-container-low rounded-2xl border border-border-subtle text-center">
                <h3 className="font-bold text-on-surface mb-2">Need Help with a Refund?</h3>
                <p className="text-sm text-on-surface-variant mb-4">Our support team is ready to assist you with any cancellation or refund requests.</p>
                <a
                  href="mailto:skillplaceacademy@gmail.com"
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
