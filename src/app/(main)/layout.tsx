'use client'

import { useEffect, useRef } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { SaveToBoardModal } from '@/components/boards/save-to-board-modal'
import { CreateBoardModal } from '@/components/boards/create-board-modal'
import { useAuthStore } from '@/stores/auth-store'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setUser, setProfile, setLoading, setInitialized } = useAuthStore()
  const initRef = useRef(false)

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initRef.current) return
    initRef.current = true

    async function initializeAuth() {
      setLoading(true)
      try {
        // Fetch session from server API (JWT-based)
        const response = await fetch('/api/auth/session')
        const data = await response.json()

        if (data.user && data.profile) {
          setUser(data.user)
          setProfile(data.profile)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    initializeAuth()
  }, [setUser, setProfile, setLoading, setInitialized])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 py-6 pb-24 md:pb-6">{children}</main>
      <MobileNav />
      <SaveToBoardModal />
      <CreateBoardModal />
    </div>
  )
}
