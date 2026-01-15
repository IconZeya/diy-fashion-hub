'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'

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

interface CategoryPillsProps {
  selectedCategory?: string | null
  onCategoryChange?: (category: string | null) => void
  className?: string
}

export function CategoryPills({
  selectedCategory,
  onCategoryChange,
  className,
}: CategoryPillsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      if (onCategoryChange) {
        onCategoryChange(selectedCategory === categoryId ? null : categoryId)
        return
      }

      // Default behavior: update URL params
      const params = new URLSearchParams(searchParams.toString())
      if (selectedCategory === categoryId) {
        params.delete('category')
      } else {
        params.set('category', categoryId)
      }
      router.push(`?${params.toString()}`)
    },
    [selectedCategory, onCategoryChange, router, searchParams]
  )

  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto pb-2 scrollbar-hide',
        className
      )}
    >
      <Button
        variant={!selectedCategory ? 'default' : 'outline'}
        size="sm"
        className="shrink-0"
        onClick={() => handleCategoryClick('')}
      >
        All
      </Button>
      {CATEGORIES.map((category) => {
        const Icon = iconMap[category.icon]
        const isSelected = selectedCategory === category.id
        return (
          <Button
            key={category.id}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            className="shrink-0"
            onClick={() => handleCategoryClick(category.id)}
          >
            {Icon && <Icon className="size-4" />}
            {category.label}
          </Button>
        )
      })}
    </div>
  )
}
