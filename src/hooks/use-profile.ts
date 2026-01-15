'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

import { useAuthStore } from '@/stores/auth-store'
import type { ProfileWithStats } from '@/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function useProfile(username: string) {
  const [profile, setProfile] = useState<ProfileWithStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  const { user } = useAuthStore()

  const fetchProfile = useCallback(async () => {
    setIsLoading(true)

    try {
      // Fetch profile
      const profileParams = new URLSearchParams()
      profileParams.append('select', '*')
      profileParams.append('username', `eq.${username}`)

      const profileResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?${profileParams.toString()}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Accept': 'application/vnd.pgrst.object+json',
          },
        }
      )

      if (!profileResponse.ok) {
        console.error('Error fetching profile:', await profileResponse.text())
        setIsLoading(false)
        return
      }

      const profileData = await profileResponse.json()

      // Fetch stats
      const statsParams = new URLSearchParams()
      statsParams.append('select', '*')
      statsParams.append('id', `eq.${profileData.id}`)

      const statsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/profile_stats?${statsParams.toString()}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Accept': 'application/vnd.pgrst.object+json',
          },
        }
      )

      let statsData = null
      if (statsResponse.ok) {
        try {
          statsData = await statsResponse.json()
        } catch {
          // No stats found
        }
      }

      // Check if current user follows this profile
      if (user && user.id !== profileData.id) {
        const followParams = new URLSearchParams()
        followParams.append('follower_id', `eq.${user.id}`)
        followParams.append('following_id', `eq.${profileData.id}`)

        const followResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/follows?${followParams.toString()}`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        )

        if (followResponse.ok) {
          const followData = await followResponse.json()
          setIsFollowing(Array.isArray(followData) && followData.length > 0)
        }
      }

      setProfile({
        ...profileData,
        stats: statsData || undefined,
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }, [username, user])

  const follow = useCallback(async () => {
    if (!user || !profile) {
      toast.error('Please sign in to follow users')
      return false
    }

    if (user.id === profile.id) {
      toast.error("You can't follow yourself")
      return false
    }

    try {
      const response = await fetch(`/api/users/${profile.username}/follow`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 409) {
          toast.error('Already following this user')
        } else {
          toast.error(data.error || 'Failed to follow user')
        }
        return false
      }

      setIsFollowing(true)
      // Update stats locally
      if (profile.stats) {
        setProfile({
          ...profile,
          stats: {
            ...profile.stats,
            follower_count: (profile.stats.follower_count || 0) + 1,
          },
        })
      }
      toast.success(`Following @${profile.username}`)
      return true
    } catch (error) {
      console.error('Follow error:', error)
      toast.error('Failed to follow user')
      return false
    }
  }, [user, profile])

  const unfollow = useCallback(async () => {
    if (!user || !profile) return false

    try {
      const response = await fetch(`/api/users/${profile.username}/follow`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        toast.error('Failed to unfollow user')
        return false
      }

      setIsFollowing(false)
      // Update stats locally
      if (profile.stats) {
        setProfile({
          ...profile,
          stats: {
            ...profile.stats,
            follower_count: Math.max(0, (profile.stats.follower_count || 0) - 1),
          },
        })
      }
      toast.success(`Unfollowed @${profile.username}`)
      return true
    } catch (error) {
      console.error('Unfollow error:', error)
      toast.error('Failed to unfollow user')
      return false
    }
  }, [user, profile])

  const toggleFollow = useCallback(async () => {
    if (isFollowing) {
      return unfollow()
    }
    return follow()
  }, [isFollowing, follow, unfollow])

  return {
    profile,
    isLoading,
    isFollowing,
    isOwnProfile: user?.id === profile?.id,
    fetchProfile,
    follow,
    unfollow,
    toggleFollow,
  }
}
