import { supabaseAdmin } from '@/lib/supabase/admin'

export type NotificationType = 'like' | 'follow' | 'comment' | 'save'

interface CreateNotificationParams {
  userId: string // The user who will receive the notification
  actorId: string // The user who performed the action
  type: NotificationType
  pinId?: string
  commentId?: string
  boardId?: string
}

/**
 * Creates a notification for a user.
 * Silently fails if notification already exists (deduplication via unique index)
 * Does not create notification if actor === user (no self-notifications)
 */
export async function createNotification({
  userId,
  actorId,
  type,
  pinId,
  commentId,
  boardId,
}: CreateNotificationParams): Promise<void> {
  // Don't create notification for self-actions
  if (userId === actorId) {
    return
  }

  try {
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      actor_id: actorId,
      type,
      pin_id: pinId || null,
      comment_id: commentId || null,
      board_id: boardId || null,
    })
  } catch (error) {
    // Silently ignore duplicate notification errors (unique constraint)
    console.error('Failed to create notification:', error)
  }
}

/**
 * Deletes a notification (e.g., when unliking a pin)
 */
export async function deleteNotification({
  userId,
  actorId,
  type,
  pinId,
}: {
  userId: string
  actorId: string
  type: NotificationType
  pinId?: string
}): Promise<void> {
  try {
    let query = supabaseAdmin
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('actor_id', actorId)
      .eq('type', type)

    if (pinId) {
      query = query.eq('pin_id', pinId)
    }

    await query
  } catch (error) {
    console.error('Failed to delete notification:', error)
  }
}
