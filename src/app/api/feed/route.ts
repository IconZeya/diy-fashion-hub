import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'
import { FEED_PAGE_SIZE } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || String(FEED_PAGE_SIZE)), 50)
  const category = searchParams.get('category')
  const filter = searchParams.get('filter') || 'discover' // 'discover' | 'following' | 'trending'

  const from = (page - 1) * limit
  const to = from + limit - 1

  const authUser = await getAuthUser()

  // Handle "following" filter - requires auth
  if (filter === 'following') {
    if (!authUser) {
      return NextResponse.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        message: 'Sign in to see posts from people you follow',
      })
    }

    // Get list of users the current user follows
    const { data: following } = await supabaseAdmin
      .from('follows')
      .select('following_id')
      .eq('follower_id', authUser.userId)

    const followingIds = following?.map((f) => f.following_id) || []

    if (followingIds.length === 0) {
      return NextResponse.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        message: 'Follow some creators to see their pins here',
      })
    }

    let query = supabaseAdmin
      .from('pins')
      .select('*, user:profiles!pins_user_id_fkey(*)', { count: 'exact' })
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error, count } = await query

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

  // Handle "trending" filter
  if (filter === 'trending') {
    // Get pins from last 7 days, ordered by engagement
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    let query = supabaseAdmin
      .from('pins')
      .select('*, user:profiles!pins_user_id_fkey(*)', { count: 'exact' })
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('like_count', { ascending: false })
      .order('comment_count', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error, count } = await query

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

  // Default "discover" filter - all pins
  let query = supabaseAdmin
    .from('pins')
    .select('*, user:profiles!pins_user_id_fkey(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error, count } = await query

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
