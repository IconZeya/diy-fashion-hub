'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Diamond,
  Gem,
  Grip,
  Palette,
  Recycle,
  Ruler,
  Scissors,
  ShoppingBag,
  Sparkles,
  Stamp,
} from 'lucide-react'

import { PinGrid, TrendingPins } from '@/components/pins'
import { usePins } from '@/hooks/use-pins'
import { CATEGORIES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Recycle,
  Sparkles,
  Palette,
  Scissors,
  Grip,
  Gem,
  Ruler,
  Stamp,
  Diamond,
  ShoppingBag,
}

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { pins, isLoading, fetchPins, likePin } = usePins({
    category: selectedCategory || undefined,
  })

  useEffect(() => {
    fetchPins(true)
  }, [selectedCategory])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="mt-1 text-muted-foreground">
          Discover DIY fashion projects by category
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {CATEGORIES.map((category) => {
          const Icon = iconMap[category.icon]
          const isSelected = selectedCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() =>
                setSelectedCategory(isSelected ? null : category.id)
              }
              className={cn(
                'flex flex-col items-center gap-3 rounded-xl p-6 transition-all',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {Icon && <Icon className="size-8" />}
              <span className="font-medium">{category.label}</span>
            </button>
          )
        })}
      </div>

      {/* Pins Section */}
      {selectedCategory && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {CATEGORIES.find((c) => c.id === selectedCategory)?.label} Projects
            </h2>
            <Link
              href={`/?category=${selectedCategory}`}
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <PinGrid
            pins={pins}
            isLoading={isLoading}
            onLike={likePin}
            emptyMessage="No projects in this category yet"
          />
        </div>
      )}

      {/* Trending Section */}
      <TrendingPins />

      {/* Recent Pins when no category selected */}
      {!selectedCategory && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <PinGrid
            pins={pins}
            isLoading={isLoading}
            onLike={likePin}
            emptyMessage="No projects yet"
          />
        </div>
      )}
    </div>
  )
}
