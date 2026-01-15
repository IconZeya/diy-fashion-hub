'use client'

import { useState, useCallback } from 'react'
import { useNotificationStore } from '@/stores/notification-store'
import type { Profile, Pin, Comment, Board } from '@/types'

export type NotificationType = 'like' | 'follow' | 'comment' | 'save'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  actor_id: string
  pin_id: string | null
  comment_id: string | null
  board_id: string | null
  read: boolean
  created_at: string
  actor: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
  pin: Pick<Pin, 'id' | 'title' | 'images'> | null
  comment: Pick<Comment, 'id' | 'content'> | null
  board: Pick<Board, 'id' | 'name'> | null
}

interface UseNotificationsReturn {
  notifications: Notification[]
  isLoading: boolean
  hasMore: boolean
  fetchNotifications: (reset?: boolean) => Promise<void>
  markAsRead: (notificationIds: string[]) => Promise<boolean>
  markAllAsRead: () => Promise<boolean>
  refreshUnreadCount: () => Promise<void>
}

const NOTIFICATIONS_PER_PAGE = 20

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const { setUnreadCount, clearUnreadCount } = useNotificationStore()

  const fetchNotifications = useCallback(async (reset = false) => {
    if (isLoading && !reset) return

    setIsLoading(true)
    const currentPage = reset ? 1 : page

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(NOTIFICATIONS_PER_PAGE),
      })

      const response = await fetch(`/api/notifications?${params}`)
      const data = await response.json()

      if (data.error) {
        console.error('Notifications error:', data.error)
        return
      }

      // Update unread count from API response
      if (typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount)
      }

      if (reset) {
        setNotifications(data.data || [])
        setPage(2)
      } else {
        setNotifications((prev) => [...prev, ...(data.data || [])])
        setPage(currentPage + 1)
      }

      setHasMore((data.data?.length || 0) === NOTIFICATIONS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, page, setUnreadCount])

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?limit=1')

      // Don't process if the request failed (table might not exist)
      if (!response.ok) {
        return
      }

      const data = await response.json()

      if (typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount)
      }
    } catch {
      // Silently fail - notifications table might not exist yet
    }
  }, [setUnreadCount])

  const markAsRead = useCallback(async (notificationIds: string[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      })

      if (!response.ok) {
        return false
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n.id) ? { ...n, read: true } : n
        )
      )

      // Refresh unread count
      await refreshUnreadCount()

      return true
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      return false
    }
  }, [refreshUnreadCount])

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })

      if (!response.ok) {
        return false
      }

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      clearUnreadCount()

      return true
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }, [clearUnreadCount])

  return {
    notifications,
    isLoading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refreshUnreadCount,
  }
}
