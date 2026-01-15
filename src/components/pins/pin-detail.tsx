'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Bookmark,
  Clock,
  ExternalLink,
  Heart,
  Share2,
  Trash2,
  ZoomIn,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ImageLightbox } from '@/components/shared'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { CATEGORIES, DIFFICULTY_LEVELS } from '@/lib/constants'
import type { PinWithDetails } from '@/types'

interface PinDetailProps {
  pin: PinWithDetails
  onLike?: () => void
  onDelete?: () => void
}

export function PinDetail({ pin, onLike, onDelete }: PinDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLiked, setIsLiked] = useState(pin.isLiked || false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const { openSaveToBoardModal } = useUIStore()
  const { user } = useAuthStore()

  const isOwner = user?.id === pin.user_id
  const category = CATEGORIES.find((c) => c.id === pin.category)
  const difficulty = DIFFICULTY_LEVELS.find((d) => d.id === pin.difficulty)

  const handleLike = () => {
    if (!user) {
      toast.error('Please sign in to like pins')
      return
    }
    setIsLiked(!isLiked)
    onLike?.()
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: pin.title,
        url: window.location.href,
      })
    } catch {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Images Section */}
      <div className="space-y-4">
        {/* Main Image */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted cursor-pointer group"
        >
          <Image
            src={pin.images[selectedImage] || '/placeholder.svg'}
            alt={pin.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            priority
          />
          {/* Zoom indicator on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-3">
              <ZoomIn className="size-6 text-white" />
            </div>
          </div>
        </button>

        {/* Thumbnails */}
        {pin.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {pin.images.map((image, index) => (
              <button
                key={image}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  'relative size-16 shrink-0 overflow-hidden rounded-lg',
                  selectedImage === index && 'ring-2 ring-primary'
                )}
              >
                <Image
                  src={image}
                  alt={`${pin.title} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Lightbox */}
        <ImageLightbox
          images={pin.images}
          initialIndex={selectedImage}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
        />
      </div>

      {/* Details Section */}
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant={isLiked ? 'default' : 'outline'}
            onClick={handleLike}
          >
            <Heart className={cn('size-4', isLiked && 'fill-current')} />
            {pin.like_count + (isLiked && !pin.isLiked ? 1 : 0)}
          </Button>

          <Button onClick={() => openSaveToBoardModal(pin.id)}>
            <Bookmark className="size-4" />
            Save
          </Button>

          <Button variant="outline" onClick={handleShare}>
            <Share2 className="size-4" />
          </Button>

          {isOwner && onDelete && (
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{pin.title}</h1>
          {pin.description && (
            <p className="mt-4 text-muted-foreground whitespace-pre-wrap">
              {pin.description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3">
          {category && (
            <span className="rounded-full bg-muted px-3 py-1 text-sm">
              {category.label}
            </span>
          )}
          {difficulty && (
            <span className={cn('rounded-full px-3 py-1 text-sm', difficulty.color)}>
              {difficulty.label}
            </span>
          )}
          {pin.estimated_time && (
            <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
              <Clock className="size-3" />
              {pin.estimated_time}
            </span>
          )}
        </div>

        {/* Materials */}
        {pin.materials && pin.materials.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Materials Needed</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              {pin.materials.map((material) => (
                <li key={material}>{material}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {pin.tags && pin.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pin.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* External Link */}
        {pin.external_link && (
          <Button variant="outline" asChild>
            <a href={pin.external_link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              View Tutorial
            </a>
          </Button>
        )}

        {/* Creator */}
        <div className="border-t pt-6">
          {pin.user.username === 'deleted_user' ? (
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-muted-foreground">
                  Deleted User
                </p>
                <p className="text-sm text-muted-foreground">
                  This account no longer exists
                </p>
              </div>
            </div>
          ) : (
            <Link
              href={`/profile/${pin.user.username}`}
              className="flex items-center gap-3 group"
            >
              <Avatar className="size-12">
                <AvatarImage
                  src={pin.user.avatar_url || undefined}
                  alt={pin.user.display_name || pin.user.username}
                />
                <AvatarFallback>
                  {pin.user.display_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium group-hover:underline">
                  {pin.user.display_name || pin.user.username}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{pin.user.username}
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
