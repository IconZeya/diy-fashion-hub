import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'
import { createNotification, deleteNotification } from '@/lib/notifications'
import { checkAndAwardBadges } from '@/lib/badges'

interface RouteParams {
  params: Promise<{ id: string }>
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

  const { error } = await supabaseAdmin.from('likes').insert({
    user_id: authUser.userId,
    pin_id: pinId,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already liked' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Create notification for pin owner
  await createNotification({
    userId: pin.user_id,
    actorId: authUser.userId,
    type: 'like',
    pinId,
  })

  // Check and award badges for likes received (for pin owner)
  checkAndAwardBadges(pin.user_id).catch(console.error)

  return NextResponse.json({ success: true }, { status: 201 })
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id: pinId } = await params
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get pin owner for notification deletion
  const { data: pin } = await supabaseAdmin
    .from('pins')
    .select('user_id')
    .eq('id', pinId)
    .single()

  const { error } = await supabaseAdmin
    .from('likes')
    .delete()
    .eq('user_id', authUser.userId)
    .eq('pin_id', pinId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Delete notification if pin exists
  if (pin) {
    await deleteNotification({
      userId: pin.user_id,
      actorId: authUser.userId,
      type: 'like',
      pinId,
    })
  }

  return NextResponse.json({ success: true })
}
