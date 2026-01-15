import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'
import { createNotification } from '@/lib/notifications'

const REPLIES_PER_PAGE = 20

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: requestId } = await params
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || String(REPLIES_PER_PAGE)), 50)

  const from = (page - 1) * limit
  const to = from + limit - 1

  // Get top-level replies (no parent)
  const { data, error, count } = await supabaseAdmin
    .from('request_replies')
    .select(`
      *,
      user:profiles!request_replies_user_id_fkey(id, username, display_name, avatar_url)
    `, { count: 'exact' })
    .eq('request_id', requestId)
    .is('parent_reply_id', null)
    .order('created_at', { ascending: true })
    .range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get nested replies for each top-level reply
  if (data && data.length > 0) {
    const replyIds = data.map(r => r.id)

    const { data: nestedReplies } = await supabaseAdmin
      .from('request_replies')
      .select(`
        *,
        user:profiles!request_replies_user_id_fkey(id, username, display_name, avatar_url)
      `)
      .in('parent_reply_id', replyIds)
      .order('created_at', { ascending: true })

    // Attach nested replies to their parents
    const repliesWithNested = data.map(reply => ({
      ...reply,
      replies: nestedReplies?.filter(nr => nr.parent_reply_id === reply.id) || []
    }))

    return NextResponse.json({
      data: repliesWithNested,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  }

  return NextResponse.json({
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: requestId } = await params
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if request exists and get owner
  const { data: diyRequest } = await supabaseAdmin
    .from('diy_requests')
    .select('id, user_id')
    .eq('id', requestId)
    .single()

  if (!diyRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { content, images, parentReplyId } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Validate images (max 5)
    const cleanImages = Array.isArray(images) ? images.slice(0, 5) : []

    // If replying to another reply, verify it exists
    if (parentReplyId) {
      const { data: parentReply } = await supabaseAdmin
        .from('request_replies')
        .select('id, user_id')
        .eq('id', parentReplyId)
        .eq('request_id', requestId)
        .single()

      if (!parentReply) {
        return NextResponse.json(
          { error: 'Parent reply not found' },
          { status: 404 }
        )
      }
    }

    const { data, error } = await supabaseAdmin
      .from('request_replies')
      .insert({
        request_id: requestId,
        user_id: authUser.userId,
        parent_reply_id: parentReplyId || null,
        content: content.trim(),
        images: cleanImages,
      })
      .select(`
        *,
        user:profiles!request_replies_user_id_fkey(id, username, display_name, avatar_url)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for request owner (if not self-reply)
    if (diyRequest.user_id !== authUser.userId) {
      await createNotification({
        userId: diyRequest.user_id,
        actorId: authUser.userId,
        type: 'comment', // Reuse comment type for request replies
      })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
