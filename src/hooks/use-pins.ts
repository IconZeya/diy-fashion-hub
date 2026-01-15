'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

import { supabaseRest, supabaseInsert, supabaseDelete } from '@/lib/supabase/rest'
import { useAuthStore } from '@/stores/auth-store'
import type { PinWithUser, PinWithDetails } from '@/types'
import { FEED_PAGE_SIZE } from '@/lib/constants'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface UsePinsOptions {
  category?: string
  userId?: string
  search?: string
}

export function usePins(options: UsePinsOptions = {}) {
  const [pins, setPins] = useState<PinWithUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const { user } = useAuthStore()

  const fetchPins = useCallback(
    async (reset = false) => {
      if (isLoading) return

      setIsLoading(true)
      const currentPage = reset ? 0 : page

      // Build query params for PostgREST
      const params = new URLSearchParams()
      params.append('select', '*, user:profiles!pins_user_id_fkey(*)')
      params.append('order', 'created_at.desc')

      if (options.category) {
        params.append('category', `eq.${options.category}`)
      }

      if (options.userId) {
        params.append('user_id', `eq.${options.userId}`)
      }

      if (options.search) {
        params.append('title', `ilike.*${options.search}*`)
      }

      const from = currentPage * FEED_PAGE_SIZE
      const to = (currentPage + 1) * FEED_PAGE_SIZE - 1

      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/pins?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Accept': 'application/json',
              'Range': `${from}-${to}`,
              'Range-Unit': 'items',
            },
          }
        )

        setIsLoading(false)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error fetching pins:', errorText)
          toast.error('Failed to load pins')
          return
        }

        const data = await response.json() as PinWithUser[]

        if (!data) {
          setPins([])
          setHasMore(false)
          return
        }

        // Ensure each pin has a user object (fallback for deleted users)
        const pinsWithFallbackUsers = data.map(pin => ({
          ...pin,
          user: pin.user || {
            id: pin.user_id,
            username: 'deleted_user',
            display_name: 'Deleted User',
            avatar_url: null,
            bio: null,
            website: null,
            location: null,
            cover_url: null,
            created_at: null,
            updated_at: null,
          }
        }))

        setPins(reset ? pinsWithFallbackUsers : [...pins, ...pinsWithFallbackUsers])
        setHasMore(data.length === FEED_PAGE_SIZE)
        setPage(reset ? 1 : currentPage + 1)
      } catch (error) {
        console.error('Error fetching pins:', error)
        setIsLoading(false)
        toast.error('Failed to load pins')
      }
    },
    [isLoading, page, pins, options]
  )

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchPins()
    }
  }, [hasMore, isLoading, fetchPins])

  const refresh = useCallback(() => {
    fetchPins(true)
  }, [fetchPins])

  const likePin = useCallback(
    async (pinId: string) => {
      if (!user) {
        toast.error('Please sign in to like pins')
        return false
      }

      console.log('Liking pin:', pinId, 'User:', user.id)

      const { error } = await supabaseInsert('likes', {
        user_id: user.id,
        pin_id: pinId,
      })

      console.log('Like result:', { error })

      if (error) {
        if (error.code === '409' || error.message.includes('duplicate') || error.message.includes('23505')) {
          // Already liked, try to unlike
          return unlikePin(pinId)
        }
        console.error('Like error:', error)
        toast.error('Failed to like pin')
        return false
      }

      // Update local state
      setPins((prev) =>
        prev.map((pin) =>
          pin.id === pinId ? { ...pin, like_count: pin.like_count + 1 } : pin
        )
      )

      return true
    },
    [user]
  )

  const unlikePin = useCallback(
    async (pinId: string) => {
      if (!user) return false

      const { error } = await supabaseDelete('likes', {
        user_id: user.id,
        pin_id: pinId,
      })

      if (error) {
        toast.error('Failed to unlike pin')
        return false
      }

      // Update local state
      setPins((prev) =>
        prev.map((pin) =>
          pin.id === pinId
            ? { ...pin, like_count: Math.max(0, pin.like_count - 1) }
            : pin
        )
      )

      return true
    },
    [user]
  )

  const deletePin = useCallback(
    async (pinId: string) => {
      if (!user) {
        toast.error('Please sign in to delete pins')
        return false
      }

      const { error } = await supabaseDelete('pins', { id: pinId })

      if (error) {
        toast.error('Failed to delete pin')
        return false
      }

      setPins((prev) => prev.filter((pin) => pin.id !== pinId))
      toast.success('Pin deleted')
      return true
    },
    [user]
  )

  return {
    pins,
    isLoading,
    hasMore,
    fetchPins,
    loadMore,
    refresh,
    likePin,
    unlikePin,
    deletePin,
  }
}

export function usePin(pinId: string) {
  const [pin, setPin] = useState<PinWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuthStore()

  const fetchPin = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // First, fetch the pin without user join to ensure we get the pin data
      const params = new URLSearchParams()
      params.append('select', '*')
      params.append('id', `eq.${pinId}`)

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/pins?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error fetching pin:', errorText)
        setError('Failed to load pin')
        setIsLoading(false)
        return
      }

      const pinsData = await response.json()

      if (!Array.isArray(pinsData) || pinsData.length === 0) {
        console.error('Pin not found:', pinId)
        setError('Pin not found')
        setIsLoading(false)
        return
      }

      const pinData = pinsData[0]

      // Now fetch the user profile separately (may be null for deleted users)
      let userData = null
      if (pinData.user_id) {
        try {
          const userResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/profiles?id=eq.${pinData.user_id}`,
            {
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Accept': 'application/json',
              },
            }
          )

          if (userResponse.ok) {
            const usersData = await userResponse.json()
            if (Array.isArray(usersData) && usersData.length > 0) {
              userData = usersData[0]
            }
          }
        } catch (err) {
          console.warn('Could not fetch pin user profile:', err)
        }
      }

      // Create a fallback user if profile is missing
      const fallbackUser = userData || {
        id: pinData.user_id,
        username: 'deleted_user',
        display_name: 'Deleted User',
        avatar_url: null,
        bio: null,
        website: null,
        location: null,
        cover_url: null,
        created_at: null,
        updated_at: null,
      }

      let pinWithDetails: PinWithDetails = {
        ...pinData,
        user: fallbackUser,
      }

      // Check if current user has liked/saved this pin
      if (user) {
        const [likeResponse, saveResponse] = await Promise.all([
          fetch(
            `${SUPABASE_URL}/rest/v1/likes?user_id=eq.${user.id}&pin_id=eq.${pinId}`,
            {
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              },
            }
          ),
          fetch(
            `${SUPABASE_URL}/rest/v1/saved_pins?pin_id=eq.${pinId}`,
            {
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              },
            }
          ),
        ])

        const likeData = await likeResponse.json()
        const saveData = await saveResponse.json()

        pinWithDetails = {
          ...pinWithDetails,
          isLiked: Array.isArray(likeData) && likeData.length > 0,
          isSaved: Array.isArray(saveData) && saveData.length > 0,
        }
      }

      setPin(pinWithDetails)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching pin:', error)
      setError('Failed to load pin')
      setIsLoading(false)
    }
  }, [pinId, user])

  return {
    pin,
    isLoading,
    error,
    fetchPin,
  }
}
