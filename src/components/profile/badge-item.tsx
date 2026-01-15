'use client'

import {
  Bookmark,
  Crown,
  Flame,
  Flower,
  Heart,
  Library,
  MessageCircle,
  MessagesSquare,
  Palette,
  Rainbow,
  Recycle,
  Scissors,
  Sprout,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Badge } from '@/hooks/use-badges'

// Map icon names to Lucide icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  seedling: Sprout,
  sprout: Sprout,
  flame: Flame,
  palette: Palette,
  crown: Crown,
  star: Star,
  sparkles: Sparkles,
  trophy: Trophy,
  recycle: Recycle,
  flower: Flower,
  rainbow: Rainbow,
  scissors: Scissors,
  heart: Heart,
  'message-circle': MessageCircle,
  'messages-square': MessagesSquare,
  bookmark: Bookmark,
  library: Library,
  zap: Zap,
}

// Category colors
const categoryColors: Record<string, string> = {
  milestone: 'bg-amber-100 text-amber-700 border-amber-200',
  category: 'bg-purple-100 text-purple-700 border-purple-200',
  community: 'bg-blue-100 text-blue-700 border-blue-200',
}

interface BadgeItemProps {
  badge: Badge
  earned?: boolean
  earnedAt?: string
  size?: 'sm' | 'md' | 'lg'
}

export function BadgeItem({ badge, earned = true, size = 'md' }: BadgeItemProps) {
  const Icon = iconMap[badge.icon] || Star

  const sizeClasses = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
  }

  const iconSizes = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center justify-center rounded-full border-2 transition-transform hover:scale-110',
              sizeClasses[size],
              earned
                ? categoryColors[badge.category]
                : 'bg-muted text-muted-foreground border-muted opacity-40'
            )}
          >
            <Icon className={iconSizes[size]} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <div className="text-center">
            <p className="font-semibold">{badge.name}</p>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
            {!earned && (
              <p className="text-xs text-muted-foreground mt-1 italic">Not yet earned</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
