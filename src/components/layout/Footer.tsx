'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import Image from "next/image";

const quickLinks = [
  { href: '/courses', label: 'Courses' },
  { href: '/programs', label: 'Programs' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
  { href: '/placements', label: 'Placements' },
]

interface Branch {
  name: string
  slug: string
}

export default function Footer() {
  const pathname = usePathname()
  const [branches, setBranches] = useState<Branch[]>([])

  const isDashboard = pathname.startsWith('/admin-place') || pathname.startsWith('/student') || pathname.includes('/learn')

  useEffect(() => {
    if (isDashboard) return
    async function fetchBranches() {
      const { data } = await supabase
        .from('branches')
        .select('name, slug')
        .eq('is_active', true)
        .order('name')

      if (data) {
        setBranches(data)
      }
    }
    fetchBranches()
  }, [isDashboard])

  if (isDashboard) return null

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
       <div className="mb-5 flex items-center gap-3">
  <Image
    src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/skillplace_logo.jpg"
    alt="SkillPlace Academy"
    width={40}
    height={40}
    className="h-10 w-10 rounded object-contain"
    priority
  />

  <span className="text-lg font-bold text-white">
    SkillPlace <span className="text-blue-400">ACADEMY</span>
  </span>
</div>
         
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Become job ready engineer in 90 days. Learn practical skills with live classes, projects, and placement assistance.
            </p>
       <div className="space-y-3">
          <a href="https://www.facebook.com/people/Skillplace-academy/61591455785175/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors group">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="font-bold group-hover:text-[#1877F2] transition-colors">Facebook</span>
          </a>
          <a href="https://instagram.com/skillplace" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors group">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="ig-gradient" x1="0" y1="0" x2="24" y2="24">
                  <stop offset="0%" stopColor="#405DE6"/>
                  <stop offset="50%" stopColor="#E4405F"/>
                  <stop offset="100%" stopColor="#FCAF45"/>
                </linearGradient>
              </defs>
              <path fill="url(#ig-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            <span className="font-bold group-hover:text-[#E4405F] transition-colors">Instagram</span>
          </a>
          <a href="https://youtube.com/skillplace" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors group">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#FF0000">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="font-bold group-hover:text-[#FF0000] transition-colors">YouTube</span>
          </a>
          <a href="https://linkedin.com/company/skillplace" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors group">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="font-bold group-hover:text-[#0A66C2] transition-colors">LinkedIn</span>
          </a>
       </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white hover:pl-1 transition-all duration-200 inline-flex items-center gap-1 group">
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Branches</h3>
            <ul className="space-y-3">
              {branches.length === 0 ? (
                <li className="text-sm text-slate-500">Loading...</li>
              ) : (
                branches.map((branch) => (
                  <li key={branch.slug}>
                    <Link href="/courses" className="text-sm text-slate-400 hover:text-white hover:pl-1 transition-all duration-200 inline-flex items-center gap-1 group">
                      <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                      {branch.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2.5">
                   <a href="mailto:info@skillplace.com" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <Mail className="h-4 w-4 text-blue-400" />
               skillplaceacademy@gmail.com
              </a>
                <a href="tel:+917987814261" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                  <Phone className="h-4 w-4 text-blue-400" />
                  79878 14261
                </a>
                <a href="tel:+918085782471" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                  <Phone className="h-4 w-4 text-blue-400" />
                  80857 82471
                </a>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-sm font-medium text-white mb-1">Location</p>
                <p className="text-sm text-slate-400">
1st floor, SD EPITOME, Gandhi chowk, beside Patel tutorial, Old High Court Rd, Bilaspur, Telipara, Chhattisgarh 495004, Bilaspur, India, 495004</p>
              </div>
            </div>
         
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                &copy; {new Date().getFullYear()} Skillplace Academy. All rights reserved.
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Sponsored by Autommensor Automation Pvt. Ltd. 
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span className="text-slate-700">|</span>
              <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
              <span className="text-slate-700">|</span>
              <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
