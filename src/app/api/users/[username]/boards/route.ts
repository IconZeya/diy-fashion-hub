import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'

interface RouteParams {
  params: Promise<{ username: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { username } = await params
  const supabase = supabaseAdmin

  const authUser = await getAuthUser()

  // Get user ID from username
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  let query = supabase
    .from('boards')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  // Only show public boards for other users
  if (!authUser || authUser.userId !== profile.id) {
    query = query.eq('is_private', false)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
