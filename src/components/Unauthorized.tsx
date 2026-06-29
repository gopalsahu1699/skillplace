'use client'

import Link from 'next/link'
import { Lock, ShieldX, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UnauthorizedProps {
  type: 'session' | 'permission' | 'login'
}

export default function Unauthorized({ type }: UnauthorizedProps) {
  if (type === 'session') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md border-slate-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
              <AlertTriangle className="h-7 w-7 text-amber-600" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Session Expired</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Your session has expired or is invalid. Please log in again.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                Log In Again
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (type === 'login') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md border-slate-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <Lock className="h-7 w-7 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Admin Access Required</CardTitle>
            <p className="text-sm text-slate-500 mt-1">You need admin privileges to access this area.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // type === 'permission'
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md border-slate-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <ShieldX className="h-7 w-7 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-slate-900">Access Denied</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            You do not have permission to access this page. Contact an admin to grant access.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/admin-place">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
              Go to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
