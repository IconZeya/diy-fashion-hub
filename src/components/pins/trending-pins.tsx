'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Flame, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { PinWithUser } from '@/types'

export function TrendingPins() {
  const [pins, setPins] = useState<PinWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    async function fetchTrending() {
      try {
        const response = await fetch('/api/pins/trending?limit=10')
        const data = await response.json()
        if (data.data) {
          setPins(data.data)
        }
      } catch (error) {
        console.error('Error fetching trending pins:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrending()
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('trending-scroll')
    if (!container) return

    const scrollAmount = 300
    const newPosition = direction === 'left'
      ? scrollPosition - scrollAmount
      : scrollPosition + scrollAmount

    container.scrollTo({ left: newPosition, behavior: 'smooth' })
    setScrollPosition(newPosition)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="size-5 text-orange-500" />
          <h2 className="text-xl font-bold">Trending Now</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-36 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (pins.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="size-5 text-orange-500" />
          <h2 className="text-xl font-bold">Trending Now</h2>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div
        id="trending-scroll"
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
      >
        {pins.map((pin) => (
          <TrendingPinCard key={pin.id} pin={pin} />
        ))}
      </div>
    </div>
  )
}

function TrendingPinCard({ pin }: { pin: PinWithUser }) {
  const primaryImage = pin.images?.[0] || '/placeholder.svg'

  return (
    <Link
      href={`/pin/${pin.id}`}
      className="group relative shrink-0 w-36"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
        <Image
          src={primaryImage}
          alt={pin.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="144px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Like count badge */}
        {pin.like_count > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-white text-xs">
            <Heart className="size-3 fill-current" />
            {pin.like_count}
          </div>
        )}
      </div>

      <p className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
        {pin.title}
      </p>
    </Link>
  )
}
