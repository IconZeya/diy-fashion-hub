import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('diy_requests')
    .select(`
      *,
      user:profiles!diy_requests_user_id_fkey(id, username, display_name, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check ownership
  const { data: existingRequest } = await supabaseAdmin
    .from('diy_requests')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existingRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  if (existingRequest.user_id !== authUser.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabaseAdmin
    .from('diy_requests')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check ownership
  const { data: existingRequest } = await supabaseAdmin
    .from('diy_requests')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existingRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  if (existingRequest.user_id !== authUser.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { title, content, tags } = body

    const updateData: Record<string, unknown> = {}
    if (title) updateData.title = title.trim()
    if (content) updateData.content = content.trim()
    if (tags) {
      updateData.tags = tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean).slice(0, 10)
    }

    const { data, error } = await supabaseAdmin
      .from('diy_requests')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user:profiles!diy_requests_user_id_fkey(id, username, display_name, avatar_url)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
