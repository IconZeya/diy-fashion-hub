import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET /api/badges - List all available badges
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('badges')
    .select('*')
    .order('category')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
