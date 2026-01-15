import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ username: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { username } = await params
  const supabase = supabaseAdmin

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (profileError) {
    if (profileError.code === 'PGRST116') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // Get stats
  const { data: stats } = await supabase
    .from('profile_stats')
    .select('*')
    .eq('id', profile.id)
    .single()

  return NextResponse.json({
    data: {
      ...profile,
      stats,
    },
  })
}
