import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ username: string }>
}

// GET /api/users/[username]/badges - Get user's earned badges
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { username } = await params

  // Get user ID from username
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Get user's earned badges with badge details
  const { data, error } = await supabaseAdmin
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', profile.id)
    .order('earned_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
