import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { FEED_PAGE_SIZE } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const type = searchParams.get('type') || 'all'
  const category = searchParams.get('category')
  const difficulty = searchParams.get('difficulty')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || String(FEED_PAGE_SIZE)), 50)

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
  }

  const supabase = supabaseAdmin
  const from = (page - 1) * limit
  const to = from + limit - 1

  const results: {
    pins?: unknown[]
    boards?: unknown[]
    users?: unknown[]
  } = {}

  // Search pins
  if (type === 'all' || type === 'pins') {
    let pinsQuery = supabase
      .from('pins')
      .select('*, user:profiles!pins_user_id_fkey(*)')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (category) {
      pinsQuery = pinsQuery.eq('category', category)
    }

    if (difficulty) {
      pinsQuery = pinsQuery.eq('difficulty', difficulty)
    }

    if (type === 'pins') {
      pinsQuery = pinsQuery.range(from, to)
    } else {
      pinsQuery = pinsQuery.limit(10)
    }

    const { data: pins } = await pinsQuery
    results.pins = pins || []
  }

  // Search boards
  if (type === 'all' || type === 'boards') {
    let boardsQuery = supabase
      .from('boards')
      .select('*, user:profiles!boards_user_id_fkey(*)')
      .eq('is_private', false)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (type === 'boards') {
      boardsQuery = boardsQuery.range(from, to)
    } else {
      boardsQuery = boardsQuery.limit(6)
    }

    const { data: boards } = await boardsQuery
    results.boards = boards || []
  }

  // Search users
  if (type === 'all' || type === 'users') {
    let usersQuery = supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (type === 'users') {
      usersQuery = usersQuery.range(from, to)
    } else {
      usersQuery = usersQuery.limit(6)
    }

    const { data: users } = await usersQuery
    results.users = users || []
  }

  return NextResponse.json({
    data: results,
    query,
    type,
  })
}
