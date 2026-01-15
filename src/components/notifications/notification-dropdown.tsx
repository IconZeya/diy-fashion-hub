'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bell, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications } from '@/hooks/use-notifications'
import { useNotificationStore } from '@/stores/notification-store'
import { NotificationItem } from './notification-item'

export function NotificationDropdown() {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { isDropdownOpen, setDropdownOpen, unreadCount } = useNotificationStore()
  const {
    notifications,
    isLoading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      fetchNotifications(true)
    }
  }, [isDropdownOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen, setDropdownOpen])

  const handleMarkAsRead = async (id: string) => {
    await markAsRead([id])
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchNotifications()
    }
  }

  if (!isDropdownOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border bg-background shadow-lg z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={handleMarkAllAsRead}
          >
            <Check className="size-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="max-h-[400px]">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bell className="size-8 mb-2" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleMarkAsRead}
              />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="p-3 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : null}
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          asChild
          onClick={() => setDropdownOpen(false)}
        >
          <Link href="/notifications">View all notifications</Link>
        </Button>
      </div>
    </div>
  )
}
