import { supabaseAdmin } from '@/lib/supabase/admin'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'milestone' | 'category' | 'community'
  requirement: Record<string, unknown>
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge: Badge
}

/**
 * Check and award badges for a user based on their activity
 * Call this after relevant actions (creating pins, gaining followers, etc.)
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const awardedBadges: string[] = []

  try {
    // Get all badges
    const { data: allBadges } = await supabaseAdmin
      .from('badges')
      .select('*')

    if (!allBadges) return []

    // Get user's existing badges
    const { data: existingBadges } = await supabaseAdmin
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId)

    const existingBadgeIds = new Set(existingBadges?.map(b => b.badge_id) || [])

    // Get user stats
    const stats = await getUserStats(userId)

    // Check each badge
    for (const badge of allBadges) {
      if (existingBadgeIds.has(badge.id)) continue

      const requirement = badge.requirement as Record<string, unknown>
      let earned = false

      // Check milestone badges
      if (requirement.pins && typeof requirement.pins === 'number') {
        if (!requirement.category) {
          // General pin count
          earned = stats.pinCount >= requirement.pins
        } else {
          // Category-specific pin count
          const categoryCount = stats.categoryPins[requirement.category as string] || 0
          earned = categoryCount >= requirement.pins
        }
      }

      if (requirement.followers && typeof requirement.followers === 'number') {
        earned = stats.followerCount >= requirement.followers
      }

      if (requirement.comments && typeof requirement.comments === 'number') {
        earned = stats.commentCount >= requirement.comments
      }

      if (requirement.saved && typeof requirement.saved === 'number') {
        earned = stats.savedCount >= requirement.saved
      }

      if (requirement.likes_received && typeof requirement.likes_received === 'number') {
        earned = stats.likesReceived >= requirement.likes_received
      }

      // Award badge if earned
      if (earned) {
        const { error } = await supabaseAdmin
          .from('user_badges')
          .insert({ user_id: userId, badge_id: badge.id })

        if (!error) {
          awardedBadges.push(badge.id)
        }
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error)
  }

  return awardedBadges
}

interface UserStats {
  pinCount: number
  followerCount: number
  commentCount: number
  savedCount: number
  likesReceived: number
  categoryPins: Record<string, number>
}

async function getUserStats(userId: string): Promise<UserStats> {
  // Get pin count and category breakdown
  const { data: pins } = await supabaseAdmin
    .from('pins')
    .select('id, category')
    .eq('user_id', userId)

  const pinCount = pins?.length || 0
  const categoryPins: Record<string, number> = {}
  pins?.forEach(pin => {
    if (pin.category) {
      categoryPins[pin.category] = (categoryPins[pin.category] || 0) + 1
    }
  })

  // Get follower count
  const { count: followerCount } = await supabaseAdmin
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)

  // Get comment count (comments on OTHER users' pins)
  const { data: comments } = await supabaseAdmin
    .from('comments')
    .select('id, pin:pins!inner(user_id)')
    .eq('user_id', userId)
    .neq('pin.user_id', userId)

  const commentCount = comments?.length || 0

  // Get saved pins count
  const { count: savedCount } = await supabaseAdmin
    .from('saved_pins')
    .select('*', { count: 'exact', head: true })
    .eq('board_id', supabaseAdmin.from('boards').select('id').eq('user_id', userId))

  // Get saved count properly
  const { data: userBoards } = await supabaseAdmin
    .from('boards')
    .select('id')
    .eq('user_id', userId)

  let actualSavedCount = 0
  if (userBoards && userBoards.length > 0) {
    const boardIds = userBoards.map(b => b.id)
    const { count } = await supabaseAdmin
      .from('saved_pins')
      .select('*', { count: 'exact', head: true })
      .in('board_id', boardIds)
    actualSavedCount = count || 0
  }

  // Get likes received on user's pins
  const { count: likesReceived } = await supabaseAdmin
    .from('likes')
    .select('*, pin:pins!inner(user_id)', { count: 'exact', head: true })
    .eq('pin.user_id', userId)

  return {
    pinCount,
    followerCount: followerCount || 0,
    commentCount,
    savedCount: actualSavedCount,
    likesReceived: likesReceived || 0,
    categoryPins,
  }
}

/**
 * Get all badges with earned status for a user
 */
export async function getUserBadgesWithStatus(userId: string): Promise<{
  badge: Badge
  earned: boolean
  earnedAt?: string
}[]> {
  const { data: allBadges } = await supabaseAdmin
    .from('badges')
    .select('*')
    .order('category')

  const { data: userBadges } = await supabaseAdmin
    .from('user_badges')
    .select('badge_id, earned_at')
    .eq('user_id', userId)

  const earnedMap = new Map(
    userBadges?.map(ub => [ub.badge_id, ub.earned_at]) || []
  )

  return (allBadges || []).map(badge => ({
    badge,
    earned: earnedMap.has(badge.id),
    earnedAt: earnedMap.get(badge.id),
  }))
}
