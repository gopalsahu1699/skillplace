import { NextRequest, NextResponse } from 'next/server'
import { getDueScheduledNotifications, markScheduledAsSent } from '@/lib/scheduled-notifications'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dueNotifications = await getDueScheduledNotifications()

    for (const notif of dueNotifications) {
      await markScheduledAsSent(
        notif.id,
        notif.target_user_id,
        notif.title,
        notif.message,
        notif.type
      )
    }

    return NextResponse.json({ processed: dueNotifications.length })
  } catch {
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
