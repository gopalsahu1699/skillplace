import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] })

export const metadata: Metadata = {
  title: "Skillplace Academy - Build Skills. Build Career.",
  description: "Learn industry-ready engineering skills through practical training, real-world projects, expert mentorship, and career guidance. Civil, Mechanical, Electrical & Electronics programs with 100% placement assistance.",
  keywords: ["engineering courses", "civil engineering", "mechanical engineering", "electrical engineering", "electronics", "AutoCAD", "Revit", "SolidWorks", "PLC training", "placement assistance", "Bilaspur", "skill training India"],
  authors: [{ name: "Skillplace Academy" }],
  openGraph: {
    title: "Skillplace Academy - Build Skills. Build Career.",
    description: "Learn industry-ready engineering skills through practical training, real-world projects, expert mentorship, and 100% placement assistance.",
    type: "website",
    locale: "en_IN",
    siteName: "Skillplace Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skillplace Academy - Build Skills. Build Career.",
    description: "Practical engineering training with real projects, industry mentors, and placement support.",
  },
  alternates: {
    canonical: "https://skillplaceacademy.com",
  },
}

export const faqMetadata = {
  title: "Frequently Asked Questions | Skillplace Academy",
  description: "Common questions about admissions, courses, certifications, online vs offline classes, placement support, and career guidance at Skillplace Academy.",
  keywords: ["admissions faq", "engineering course questions", "placement support", "skillplace academy certification", "online engineering course"],
  openGraph: {
    title: "Frequently Asked Questions | Skillplace Academy",
    description: "Get answers to common questions about admissions, courses, certifications, placements, and more.",
    type: "website",
    locale: "en_IN",
    siteName: "Skillplace Academy",
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0..200&display=swap" />
      </head>
      <body className={`${inter.className} ${jakarta.className}`}>
        <Toaster position="top-right" richColors closeButton duration={4000} />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
