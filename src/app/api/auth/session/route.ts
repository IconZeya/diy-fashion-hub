import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/verify'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ user: null, profile: null })
  }

  // Fetch profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', authUser.userId)
    .single()

  if (!profile) {
    return NextResponse.json({ user: null, profile: null })
  }

  return NextResponse.json({
    user: {
      id: authUser.userId,
      email: authUser.email,
    },
    profile: {
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      cover_url: profile.cover_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    },
  })
}
