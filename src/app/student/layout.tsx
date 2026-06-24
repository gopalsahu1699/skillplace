import StudentSidebar from '@/components/layout/StudentSidebar'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <StudentSidebar />
      <main className="flex-1 p-6 ml-64">{children}</main>
    </div>
  )
}
