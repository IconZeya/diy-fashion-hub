import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'
import { createNotification, deleteNotification } from '@/lib/notifications'
import { checkAndAwardBadges } from '@/lib/badges'

interface RouteParams {
  params: Promise<{ username: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { username } = await params
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user ID from username
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (profile.id === authUser.userId) {
    return NextResponse.json(
      { error: "You can't follow yourself" },
      { status: 400 }
    )
  }

  const { error } = await supabaseAdmin.from('follows').insert({
    follower_id: authUser.userId,
    following_id: profile.id,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Create notification for followed user
  await createNotification({
    userId: profile.id,
    actorId: authUser.userId,
    type: 'follow',
  })

  // Check and award badges for follower milestones (for the followed user)
  checkAndAwardBadges(profile.id).catch(console.error)

  return NextResponse.json({ success: true }, { status: 201 })
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { username } = await params
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user ID from username
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { error } = await supabaseAdmin
    .from('follows')
    .delete()
    .eq('follower_id', authUser.userId)
    .eq('following_id', profile.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Delete follow notification
  await deleteNotification({
    userId: profile.id,
    actorId: authUser.userId,
    type: 'follow',
  })

  return NextResponse.json({ success: true })
}
