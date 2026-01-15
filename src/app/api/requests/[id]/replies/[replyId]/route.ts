import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'

interface RouteParams {
  params: Promise<{ id: string; replyId: string }>
}

// Edit a reply
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { replyId } = await params
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { content, images } = body

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  // Check ownership
  const { data: reply } = await supabaseAdmin
    .from('request_replies')
    .select('user_id')
    .eq('id', replyId)
    .single()

  if (!reply) {
    return NextResponse.json({ error: 'Reply not found' }, { status: 404 })
  }

  if (reply.user_id !== authUser.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update the reply
  const { data: updatedReply, error } = await supabaseAdmin
    .from('request_replies')
    .update({
      content: content.trim(),
      images: images || [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', replyId)
    .select(`
      *,
      user:profiles!request_replies_user_id_fkey(*)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(updatedReply)
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { replyId } = await params
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check ownership
  const { data: reply } = await supabaseAdmin
    .from('request_replies')
    .select('user_id')
    .eq('id', replyId)
    .single()

  if (!reply) {
    return NextResponse.json({ error: 'Reply not found' }, { status: 404 })
  }

  if (reply.user_id !== authUser.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabaseAdmin
    .from('request_replies')
    .delete()
    .eq('id', replyId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
