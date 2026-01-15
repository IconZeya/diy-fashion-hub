import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'
import { createNotification } from '@/lib/notifications'
import { checkAndAwardBadges } from '@/lib/badges'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: pinId } = await params
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabaseAdmin
    .from('comments')
    .select('*, user:profiles!comments_user_id_fkey(*)', { count: 'exact' })
    .eq('pin_id', pinId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: pinId } = await params
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if pin exists and get owner
  const { data: pin } = await supabaseAdmin
    .from('pins')
    .select('id, user_id')
    .eq('id', pinId)
    .single()

  if (!pin) {
    return NextResponse.json({ error: 'Pin not found' }, { status: 404 })
  }

  try {
    const body = await request.json()

    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        pin_id: pinId,
        user_id: authUser.userId,
        content: body.content.trim(),
      })
      .select('*, user:profiles!comments_user_id_fkey(*)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for pin owner
    await createNotification({
      userId: pin.user_id,
      actorId: authUser.userId,
      type: 'comment',
      pinId,
      commentId: data.id,
    })

    // Check and award badges for comment milestones (for commenter)
    checkAndAwardBadges(authUser.userId).catch(console.error)

    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
