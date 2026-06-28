'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GraduationCap, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

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
  const [branches, setBranches] = useState<Branch[]>([])

  useEffect(() => {
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
  }, [])

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                skillplace <span className="text-blue-400">ACADEMY</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Become job ready engineer in 90 days. Learn practical skills with live classes, projects, and placement assistance.
            </p>
            <div className="space-y-2.5">
              <a href="mailto:info@skillplace.com" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <Mail className="h-4 w-4 text-blue-400" />
                info@skillplace.com
              </a>
              <div className="flex flex-col gap-2.5">
                <a href="tel:+917987814261" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                  <Phone className="h-4 w-4 text-blue-400" />
                  79878 14261
                </a>
                <a href="tel:+918085782471" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                  <Phone className="h-4 w-4 text-blue-400" />
                  80857 82471
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4 text-blue-400" />
                Bilaspur, Chhattisgarh
              </div>
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
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-sm font-medium text-white mb-1">Phone / WhatsApp</p>
                <p className="text-sm text-slate-400">7987814261</p>
                <p className="text-sm text-slate-400">8085782471</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-sm font-medium text-white mb-1">Location</p>
                <p className="text-sm text-slate-400">Bilaspur, Chhattisgarh</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Skillplace Academy. All rights reserved.
            </p>
            <p className="text-xs text-slate-600">
              Sponsored by Autommensor Automation Pvt. Ltd. | Industry Partner: himanshu construction
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
