import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'

const REQUESTS_PER_PAGE = 20

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || String(REQUESTS_PER_PAGE)), 50)
  const search = searchParams.get('search') || ''
  const tag = searchParams.get('tag') || ''

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from('diy_requests')
    .select(`
      *,
      user:profiles!diy_requests_user_id_fkey(id, username, display_name, avatar_url)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  // Search by text
  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  // Filter by tag
  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching requests:', error)
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
    const { title, content, tags, images } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Clean and validate tags
    const cleanTags = Array.isArray(tags)
      ? tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean).slice(0, 10)
      : []

    // Validate images
    const cleanImages = Array.isArray(images) ? images.slice(0, 5) : []

    const { data, error } = await supabaseAdmin
      .from('diy_requests')
      .insert({
        user_id: authUser.userId,
        title: title.trim(),
        content: content.trim(),
        tags: cleanTags,
        images: cleanImages,
      })
      .select(`
        *,
        user:profiles!diy_requests_user_id_fkey(id, username, display_name, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error creating request:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
