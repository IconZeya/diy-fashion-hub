'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bookmark, Heart, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import type { PinWithUser } from '@/types'

interface PinCardProps {
  pin: PinWithUser
  onLike?: (pinId: string) => void
  onDelete?: (pinId: string) => void
}

export function PinCard({ pin, onLike, onDelete }: PinCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const { openSaveToBoardModal } = useUIStore()
  const { user } = useAuthStore()

  const isOwner = user?.id === pin.user_id
  const primaryImage = pin.images?.[0] || '/placeholder.svg'

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link href={`/pin/${pin.id}`} className="block">
        <div className="relative overflow-hidden rounded-xl bg-muted">
          <Image
            src={primaryImage}
            alt={pin.title}
            width={300}
            height={400}
            className={cn(
              'w-full object-cover transition-opacity duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}

          {/* Hover Overlay */}
          <div
            className={cn(
              'absolute inset-0 bg-black/40 transition-opacity duration-200',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          />

          {/* Action Buttons - Visible on hover */}
          <div
            className={cn(
              'absolute inset-x-0 top-0 flex justify-between p-3 transition-opacity duration-200',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          >
            {/* Save Button */}
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                openSaveToBoardModal(pin.id)
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Bookmark className="size-4" />
              Save
            </Button>

            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="size-8"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/pin/${pin.id}`}>View pin</Link>
                </DropdownMenuItem>
                {isOwner && onDelete && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(pin.id)}
                  >
                    Delete pin
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Like Button - Bottom right */}
          <div
            className={cn(
              'absolute bottom-3 right-3 transition-opacity duration-200',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          >
            <Button
              size="icon"
              variant="secondary"
              className="size-8"
              onClick={(e) => {
                e.preventDefault()
                onLike?.(pin.id)
              }}
            >
              <Heart className="size-4" />
            </Button>
          </div>
        </div>
      </Link>

      {/* Pin Info */}
      <div className="mt-2 space-y-1">
        <Link
          href={`/pin/${pin.id}`}
          className="line-clamp-2 text-sm font-medium hover:underline"
        >
          {pin.title}
        </Link>

        <div className="flex items-center justify-between">
          {pin.user.username === 'deleted_user' ? (
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarFallback className="text-xs">?</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                Deleted User
              </span>
            </div>
          ) : (
            <Link
              href={`/profile/${pin.user.username}`}
              className="flex items-center gap-2 group/user"
            >
              <Avatar className="size-6">
                <AvatarImage
                  src={pin.user.avatar_url || undefined}
                  alt={pin.user.display_name || pin.user.username}
                />
                <AvatarFallback className="text-xs">
                  {pin.user.display_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground group-hover/user:text-foreground">
                {pin.user.display_name || pin.user.username}
              </span>
            </Link>
          )}

          {pin.like_count > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="size-3" />
              {pin.like_count}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
