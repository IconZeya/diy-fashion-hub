import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ tag: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag).toLowerCase()

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const from = (page - 1) * limit
  const to = from + limit - 1

  // Query pins where the tag exists in the tags array
  // Using @> operator for array containment
  const { data, error, count } = await supabaseAdmin
    .from('pins')
    .select('*, user:profiles!pins_user_id_fkey(*)', { count: 'exact' })
    .contains('tags', [decodedTag])
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    tag: decodedTag,
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}
