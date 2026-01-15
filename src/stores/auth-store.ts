import { create } from 'zustand'
import type { Profile } from '@/types'

// Simplified user type (no longer using Supabase User type)
export interface AuthUser {
  id: string
  email: string
}

interface AuthState {
  user: AuthUser | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean
  setUser: (user: AuthUser | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (isLoading: boolean) => void
  setInitialized: (isInitialized: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  logout: () => set({ user: null, profile: null }), }))