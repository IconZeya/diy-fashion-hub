'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, MoreHorizontal, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth-store'
import type { DIYRequestWithUser } from '@/types'

interface RequestCardProps {
  request: DIYRequestWithUser
  onDelete?: (id: string) => void
}

export function RequestCard({ request, onDelete }: RequestCardProps) {
  const [imageError, setImageError] = useState<Record<number, boolean>>({})
  const { user } = useAuthStore()
  const isOwner = user?.id === request.user_id

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between">
        <Link
          href={`/profile/${request.user.username}`}
          className="flex items-center gap-3 group"
        >
          <Avatar className="size-10">
            <AvatarImage
              src={request.user.avatar_url || undefined}
              alt={request.user.display_name || request.user.username}
            />
            <AvatarFallback>
              {request.user.display_name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium group-hover:underline">
              {request.user.display_name || request.user.username}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
            </p>
          </div>
        </Link>

        {isOwner && onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(request.id)}
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      <Link href={`/requests/${request.id}`} className="block space-y-2">
        <h3 className="font-semibold text-lg hover:text-primary transition-colors">
          {request.title}
        </h3>
        <p className="text-muted-foreground line-clamp-3">{request.content}</p>
      </Link>

      {/* Images */}
      {request.images && request.images.length > 0 && (
        <Link href={`/requests/${request.id}`} className="block">
          <div className={`grid gap-2 ${request.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {request.images.slice(0, 4).map((image, index) => (
              <div
                key={image}
                className="relative aspect-video rounded-lg overflow-hidden bg-muted"
              >
                {!imageError[index] ? (
                  <Image
                    src={image}
                    alt={`${request.title} image ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={() => setImageError((prev) => ({ ...prev, [index]: true }))}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                    Image unavailable
                  </div>
                )}
                {index === 3 && request.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium">
                    +{request.images.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Link>
      )}

      {/* Tags */}
      {request.tags && request.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {request.tags.map((tag) => (
            <Link
              key={tag}
              href={`/requests?tag=${encodeURIComponent(tag)}`}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center pt-2 border-t">
        <Link
          href={`/requests/${request.id}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="size-4" />
          {request.reply_count} {request.reply_count === 1 ? 'reply' : 'replies'}
        </Link>
      </div>
    </div>
  )
}
