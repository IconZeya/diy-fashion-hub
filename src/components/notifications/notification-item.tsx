'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Bookmark, Heart, MessageCircle, UserPlus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Notification } from '@/hooks/use-notifications'

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
}

const typeConfig = {
  like: {
    icon: Heart,
    iconColor: 'text-red-500',
    getMessage: (n: Notification) => `liked your pin "${n.pin?.title}"`,
    getLink: (n: Notification) => `/pin/${n.pin_id}`,
  },
  follow: {
    icon: UserPlus,
    iconColor: 'text-blue-500',
    getMessage: () => 'started following you',
    getLink: (n: Notification) => `/profile/${n.actor.username}`,
  },
  comment: {
    icon: MessageCircle,
    iconColor: 'text-green-500',
    getMessage: (n: Notification) => `commented on your pin: "${n.comment?.content?.slice(0, 50)}${(n.comment?.content?.length || 0) > 50 ? '...' : ''}"`,
    getLink: (n: Notification) => `/pin/${n.pin_id}`,
  },
  save: {
    icon: Bookmark,
    iconColor: 'text-purple-500',
    getMessage: (n: Notification) => `saved your pin "${n.pin?.title}" to ${n.board?.name || 'a board'}`,
    getLink: (n: Notification) => `/pin/${n.pin_id}`,
  },
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const config = typeConfig[notification.type]
  const Icon = config.icon

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id)
    }
  }

  const userInitials = notification.actor?.display_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  return (
    <Link
      href={config.getLink(notification)}
      onClick={handleClick}
      className={cn(
        'flex gap-3 p-3 hover:bg-muted/50 transition-colors',
        !notification.read && 'bg-primary/5'
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="size-10">
          <AvatarImage src={notification.actor?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
        </Avatar>
        <div className={cn(
          'absolute -bottom-1 -right-1 rounded-full bg-background p-0.5',
        )}>
          <Icon className={cn('size-3.5', config.iconColor)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">
            {notification.actor?.display_name || notification.actor?.username}
          </span>{' '}
          <span className="text-muted-foreground">
            {config.getMessage(notification)}
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Pin thumbnail for pin-related notifications */}
      {notification.pin?.images?.[0] && (
        <div className="relative size-12 shrink-0 rounded-lg overflow-hidden bg-muted">
          <Image
            src={notification.pin.images[0]}
            alt=""
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      )}

      {/* Unread indicator */}
      {!notification.read && (
        <div className="shrink-0 self-center">
          <div className="size-2 rounded-full bg-primary" />
        </div>
      )}
    </Link>
  )
}
