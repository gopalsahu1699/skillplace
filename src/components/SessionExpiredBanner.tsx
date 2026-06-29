'use client'

import Link from 'next/link'
import { AlertTriangle, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SessionExpiredBanner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md border-amber-200 bg-amber-50/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
            <AlertTriangle className="h-7 w-7 text-amber-600" />
          </div>
          <CardTitle className="text-xl text-slate-900">Session Expired</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Your login session has expired. Please log in again to continue.
          </p>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
              <LogIn className="h-4 w-4" />
              Log In Again
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
