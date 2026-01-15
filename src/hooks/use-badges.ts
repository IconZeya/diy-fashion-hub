'use client'

import { useState, useCallback } from 'react'

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

interface UseBadgesReturn {
  badges: UserBadge[]
  isLoading: boolean
  fetchBadges: () => Promise<void>
}

export function useBadges(username: string): UseBadgesReturn {
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchBadges = useCallback(async () => {
    if (!username) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${username}/badges`)
      const data = await response.json()

      if (data.data) {
        setBadges(data.data)
      }
    } catch (error) {
      console.error('Error fetching badges:', error)
    } finally {
      setIsLoading(false)
    }
  }, [username])

  return {
    badges,
    isLoading,
    fetchBadges,
  }
}

// Hook to fetch all available badges
export function useAllBadges() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchAllBadges = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/badges')
      const data = await response.json()

      if (data.data) {
        setBadges(data.data)
      }
    } catch (error) {
      console.error('Error fetching all badges:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    badges,
    isLoading,
    fetchAllBadges,
  }
}
