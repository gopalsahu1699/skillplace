import type { Metadata, Viewport } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Toaster } from "sonner"
import ClientLayout from "@/components/ClientLayout"
import { SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS } from "@/lib/seo/metadata"
import JsonLd from "@/components/seo/JsonLd"
import { organizationSchema, websiteSchema, localBusinessSchema } from "@/lib/seo/json-ld"

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", variable: "--font-plus-jakarta", weight: ["400", "500", "600", "700", "800"] })

const BASE_URL = "https://www.skillplace.in"

export const metadata: Metadata = {
  title: `${SITE_NAME} - Build Skills. Build Career.`,
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS.join(", "),
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: BASE_URL,
    languages: {
      "en-IN": BASE_URL,
      "hi": BASE_URL,
    },
  },
  openGraph: {
    title: `${SITE_NAME} - Build Skills. Build Career.`,
    description: SITE_DESCRIPTION,
    url: BASE_URL,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
    images: [
      { url: `${BASE_URL}/android-chrome-512x512.png`, width: 512, height: 512, alt: SITE_NAME },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Build Skills. Build Career.`,
    description: SITE_DESCRIPTION,
    images: [`${BASE_URL}/android-chrome-512x512.png`],
    creator: "@skillplace",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
    yandex: "",
    yahoo: "",
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#131b2e",
    "msapplication-TileImage": "/android-chrome-512x512.png",
    "theme-color": "#131b2e",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#131b2e" },
    { media: "(prefers-color-scheme: dark)", color: "#131b2e" },
  ],
  colorScheme: "light",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" dir="ltr" className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-CWL8C5JYT5"></script>
        <script dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-CWL8C5JYT5');`,
        }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0..200&display=swap';document.head.appendChild(l)})()`,
        }} />
        <link rel="dns-prefetch" href="https://sdk.cashfree.com" />
        <link rel="preconnect" href="https://sdk.cashfree.com" />
        <link rel="dns-prefetch" href="https://api.cashfree.com" />
        <link rel="preconnect" href="https://api.cashfree.com" />
        <link rel="dns-prefetch" href="https://weebasgxtemffakbvcfa.supabase.co" />
        <link rel="preconnect" href="https://weebasgxtemffakbvcfa.supabase.co" />
        <meta name="geo.region" content="IN-CT" />
        <meta name="geo.placename" content="Bilaspur" />
        <meta name="geo.position" content="22.0775;82.1642" />
        <meta name="ICBM" content="22.0775, 82.1642" />
        <meta name="copyright" content={`Copyright © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.`} />
        <meta name="author" content={SITE_NAME} />
        <meta name="rating" content="General" />
        <meta name="revisit-after" content="7 days" />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />
        <meta name="category" content="education" />
        <meta name="coverage" content="India" />
        <meta name="distribution" content="global" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta property="og:locale:alternate" content="hi_IN" />
        <link rel="alternate" hrefLang="en-IN" href={BASE_URL} />
        <link rel="alternate" hrefLang="hi" href={BASE_URL} />
        <link rel="alternate" hrefLang="x-default" href={BASE_URL} />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <JsonLd data={localBusinessSchema()} />
      </head>
      <body className={`${inter.className} ${jakarta.className} antialiased`} suppressHydrationWarning>
        <ClientLayout>
          <Toaster position="top-right" richColors closeButton duration={4000} />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ClientLayout>
      </body>
    </html>
  )
}
