'use client'

import { useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotificationStore } from '@/stores/notification-store'
import { useNotifications } from '@/hooks/use-notifications'
import { useAuthStore } from '@/stores/auth-store'
import { NotificationDropdown } from './notification-dropdown'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { user } = useAuthStore()
  const { unreadCount, toggleDropdown, isDropdownOpen } = useNotificationStore()
  const { refreshUnreadCount } = useNotifications()

  // Fetch unread count on mount and periodically
  useEffect(() => {
    if (user) {
      refreshUnreadCount()

      // Refresh every 60 seconds
      const interval = setInterval(refreshUnreadCount, 60000)
      return () => clearInterval(interval)
    }
  }, [user, refreshUnreadCount])

  if (!user) return null

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDropdown}
        className={cn(
          'relative',
          isDropdownOpen && 'bg-muted'
        )}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <span className="sr-only">
          Notifications {unreadCount > 0 ? `(${unreadCount} unread)` : ''}
        </span>
      </Button>

      <NotificationDropdown />
    </div>
  )
}
