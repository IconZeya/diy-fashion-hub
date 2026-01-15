'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useAuthStore } from '@/stores/auth-store'
import type { Profile } from '@/types'

export function useAuth() {
  const router = useRouter()
  const {
    user,
    profile,
    isLoading,
    isInitialized,
    setProfile,
    setLoading,
    logout: logoutStore,
  } = useAuthStore()

  const refreshProfile = useCallback(async () => {
    if (!user) return null

    try {
      const response = await fetch('/api/auth/session')

      if (!response.ok) {
        console.error('Error fetching profile:', await response.text())
        return null
      }

      const data = await response.json()
      if (data.profile) {
        setProfile(data.profile)
      }
      return data.profile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }, [user, setProfile])

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) {
        toast.error('You must be logged in to update your profile')
        return null
      }

      setLoading(true)

      try {
        const response = await fetch('/api/users/me', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            displayName: updates.display_name,
            bio: updates.bio,
            avatarUrl: updates.avatar_url,
            coverUrl: updates.cover_url,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          toast.error(error.error || 'Failed to update profile')
          return null
        }

        const { data } = await response.json()
        if (data) {
          setProfile(data)
        }
        toast.success('Profile updated successfully')
        return data
      } catch (error) {
        console.error('Error updating profile:', error)
        toast.error('Failed to update profile')
        return null
      } finally {
        setLoading(false)
      }
    },
    [user, setProfile, setLoading]
  )

  const logout = useCallback(async () => {
    setLoading(true)

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch {
      // Continue with logout even if API fails
    }

    setLoading(false)
    logoutStore()
    router.push('/login')
    router.refresh()
    toast.success('Signed out successfully')
  }, [logoutStore, router, setLoading])

  return {
    user,
    profile,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    refreshProfile,
    updateProfile,
    logout,
  }
}
