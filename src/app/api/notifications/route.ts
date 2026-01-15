import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'

const NOTIFICATIONS_PER_PAGE = 20

export async function GET(request: NextRequest) {
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || String(NOTIFICATIONS_PER_PAGE)), 50)
  const unreadOnly = searchParams.get('unread') === 'true'

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from('notifications')
    .select(`
      *,
      actor:profiles!notifications_actor_id_fkey(id, username, display_name, avatar_url),
      pin:pins(id, title, images),
      comment:comments(id, content),
      board:boards(id, name)
    `, { count: 'exact' })
    .eq('user_id', authUser.userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (unreadOnly) {
    query = query.eq('read', false)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get unread count
  const { count: unreadCount } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', authUser.userId)
    .eq('read', false)

  return NextResponse.json({
    data,
    unreadCount: unreadCount || 0,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}

// Mark notifications as read
export async function PUT(request: NextRequest) {
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { notificationIds, markAllRead } = body

    if (markAllRead) {
      // Mark all notifications as read for this user
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ read: true })
        .eq('user_id', authUser.userId)
        .eq('read', false)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ read: true })
        .eq('user_id', authUser.userId)
        .in('id', notificationIds)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      return NextResponse.json(
        { error: 'Either notificationIds array or markAllRead flag is required' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
