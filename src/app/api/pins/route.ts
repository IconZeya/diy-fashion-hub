import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'
import { checkAndAwardBadges } from '@/lib/badges'
import { FEED_PAGE_SIZE } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || String(FEED_PAGE_SIZE)), 50)
  const category = searchParams.get('category')
  const userId = searchParams.get('userId')
  const search = searchParams.get('search')

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from('pins')
    .select('*, user:profiles!pins_user_id_fkey(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (category) {
    query = query.eq('category', category)
  }

  if (userId) {
    query = query.eq('user_id', userId)
  }

  if (search) {
    query = query.ilike('title', `%${search}%`)
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

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('pins')
      .insert({
        user_id: authUser.userId,
        title: body.title,
        description: body.description,
        images: body.images,
        category: body.category,
        difficulty: body.difficulty,
        estimated_time: body.estimatedTime,
        materials: body.materials,
        tags: body.tags,
        external_link: body.externalLink,
      })
      .select('*, user:profiles!pins_user_id_fkey(*)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Check and award badges for pin creation milestones
    checkAndAwardBadges(authUser.userId).catch(console.error)

    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
