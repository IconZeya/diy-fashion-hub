import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'
import { createNotification } from '@/lib/notifications'
import { checkAndAwardBadges } from '@/lib/badges'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: boardId } = await params
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const authUser = await getAuthUser()

  // Check board access
  const { data: board } = await supabaseAdmin
    .from('boards')
    .select('user_id, is_private')
    .eq('id', boardId)
    .single()

  if (!board) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 })
  }

  if (board.is_private && (!authUser || board.user_id !== authUser.userId)) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 })
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabaseAdmin
    .from('saved_pins')
    .select('pin:pins(*, user:profiles!pins_user_id_fkey(*))', { count: 'exact' })
    .eq('board_id', boardId)
    .order('saved_at', { ascending: false })
    .range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const pins = data?.map((item) => item.pin).filter(Boolean) || []

  return NextResponse.json({
    data: pins,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: boardId } = await params
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check board ownership
  const { data: board } = await supabaseAdmin
    .from('boards')
    .select('user_id')
    .eq('id', boardId)
    .single()

  if (!board) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 })
  }

  if (board.user_id !== authUser.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const pinId = body.pinId

    // Get pin owner for notification
    const { data: pin } = await supabaseAdmin
      .from('pins')
      .select('user_id')
      .eq('id', pinId)
      .single()

    const { error } = await supabaseAdmin.from('saved_pins').insert({
      board_id: boardId,
      pin_id: pinId,
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Pin already saved to this board' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create notification for pin owner
    if (pin) {
      await createNotification({
        userId: pin.user_id,
        actorId: authUser.userId,
        type: 'save',
        pinId,
        boardId,
      })
    }

    // Check and award badges for curator milestones (for saver)
    checkAndAwardBadges(authUser.userId).catch(console.error)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id: boardId } = await params
  const { searchParams } = new URL(request.url)
  const pinId = searchParams.get('pinId')

  if (!pinId) {
    return NextResponse.json({ error: 'pinId is required' }, { status: 400 })
  }

  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check board ownership
  const { data: board } = await supabaseAdmin
    .from('boards')
    .select('user_id')
    .eq('id', boardId)
    .single()

  if (!board) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 })
  }

  if (board.user_id !== authUser.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabaseAdmin
    .from('saved_pins')
    .delete()
    .eq('board_id', boardId)
    .eq('pin_id', pinId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
