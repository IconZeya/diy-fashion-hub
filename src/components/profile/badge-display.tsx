'use client'

import { useEffect } from 'react'
import { Award } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useBadges } from '@/hooks/use-badges'
import { BadgeItem } from './badge-item'

interface BadgeDisplayProps {
  username: string
  showTitle?: boolean
  maxDisplay?: number
}

export function BadgeDisplay({ username, showTitle = true, maxDisplay }: BadgeDisplayProps) {
  const { badges, isLoading, fetchBadges } = useBadges(username)

  useEffect(() => {
    fetchBadges()
  }, [fetchBadges])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {showTitle && <Skeleton className="h-5 w-24" />}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="size-10 rounded-full" />
          ))}
        </div>
      </div>
    )
  }

  if (badges.length === 0) {
    return null
  }

  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges
  const remainingCount = maxDisplay ? badges.length - maxDisplay : 0

  return (
    <div className="space-y-3">
      {showTitle && (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Award className="size-4" />
          <span>Badges ({badges.length})</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {displayBadges.map((userBadge) => (
          <BadgeItem
            key={userBadge.badge_id}
            badge={userBadge.badge}
            earned={true}
          />
        ))}
        {remainingCount > 0 && (
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  )
}
