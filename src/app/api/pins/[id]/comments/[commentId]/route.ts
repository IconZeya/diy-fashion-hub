import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth/verify'

interface RouteParams {
  params: Promise<{ id: string; commentId: string }>
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id: pinId, commentId } = await params
  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the comment to verify ownership
  const { data: comment, error: fetchError } = await supabaseAdmin
    .from('comments')
    .select('id, user_id, pin_id')
    .eq('id', commentId)
    .eq('pin_id', pinId)
    .single()

  if (fetchError || !comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  // Only allow comment owner to delete
  if (comment.user_id !== authUser.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error: deleteError } = await supabaseAdmin
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
