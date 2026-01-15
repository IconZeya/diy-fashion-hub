import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('pins')
    .select('*, user:profiles!pins_user_id_fkey(*)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check ownership
  const { data: pin } = await supabaseAdmin
    .from('pins')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!pin) {
    return NextResponse.json({ error: 'Pin not found' }, { status: 404 })
  }

  if (pin.user_id !== authUser.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('pins')
      .update({
        title: body.title,
        description: body.description,
        images: body.images,
        category: body.category,
        difficulty: body.difficulty,
        estimated_time: body.estimatedTime,
        materials: body.materials,
        tags: body.tags,
        external_link: body.externalLink,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, user:profiles!pins_user_id_fkey(*)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check ownership
  const { data: pin } = await supabaseAdmin
    .from('pins')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!pin) {
    return NextResponse.json({ error: 'Pin not found' }, { status: 404 })
  }

  if (pin.user_id !== authUser.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabaseAdmin.from('pins').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
