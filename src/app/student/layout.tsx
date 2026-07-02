'use client'

import { useState } from 'react'
import StudentSidebar from '@/components/layout/StudentSidebar'
import StudentNavbar from '@/components/layout/StudentNavbar'
import AuthGuard from '@/components/AuthGuard'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AuthGuard>
      <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <StudentNavbar />
        <div className="flex flex-1">
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/30 z-40 md:hidden" 
              onClick={() => setSidebarOpen(false)} 
            />
          )}
          <StudentSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 p-4 md:p-6 min-h-[calc(100vh-3.5rem)]">
            <div className="md:hidden mb-4">
              <button 
                className="p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          {children}
        </main>
      </div>
    </div>
    </ErrorBoundary>
    </AuthGuard>
  )
}
