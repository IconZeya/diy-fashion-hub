import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'

export async function GET() {
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', authUser.userId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get stats
  const { data: stats } = await supabaseAdmin
    .from('profile_stats')
    .select('*')
    .eq('id', authUser.userId)
    .single()

  return NextResponse.json({
    data: {
      ...profile,
      stats,
      email: authUser.email,
    },
  })
}

export async function PUT(request: NextRequest) {
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        display_name: body.displayName,
        bio: body.bio,
        avatar_url: body.avatarUrl,
        cover_url: body.coverUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
