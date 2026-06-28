'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PurchaseWithCourse {
  id: string
  course_id: string
  amount: number
  status: string
  created_at: string
  courses: {
    title: string
    slug: string
    thumbnail_url: string | null
  } | null
}

export default function PurchasedCourses() {
  const [purchases, setPurchases] = useState<PurchaseWithCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    async function fetchPurchases() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        setLoading(false)
        return
      }

      setUser(currentUser)

      const { data } = await supabase
        .from('purchases')
        .select('*, courses(title, slug, thumbnail_url)')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (data) {
        setPurchases(data as PurchaseWithCourse[])
      }
      setLoading(false)
    }

    fetchPurchases()
  }, [])

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4 animate-pulse">My Purchased Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-32 bg-slate-100 animate-pulse" />
              <CardContent className="p-4">
                <div className="h-4 bg-slate-100 rounded animate-pulse mb-2" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!user || purchases.length === 0) {
    return null
  }

  return (
    <div className="mb-2">
      <h2 className="text-xl font-bold text-slate-900 mb-4">My Purchased Courses</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {purchases.map((purchase) => (
          <Card key={purchase.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="h-32 bg-slate-100 flex items-center justify-center">
              {purchase.courses?.thumbnail_url ? (
                <img
                  src={purchase.courses.thumbnail_url}
                  alt={purchase.courses.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-slate-400 text-sm">No thumbnail</span>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className={
                    purchase.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }
                >
                  {purchase.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-slate-900 mb-3 line-clamp-1">
                {purchase.courses?.title}
              </h3>
              <Link href={`/courses/${purchase.courses?.slug}`}>
                <Button className="w-full" variant="outline">
                  {purchase.status === 'completed' ? 'Start Learning' : 'View Course'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
