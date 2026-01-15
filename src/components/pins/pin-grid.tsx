'use client'

import Masonry from 'react-masonry-css'
import { PinCard } from './pin-card'
import { PinGridSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { Pin } from 'lucide-react'
import type { PinWithUser } from '@/types'

interface PinGridProps {
  pins: PinWithUser[]
  isLoading?: boolean
  emptyMessage?: string
  emptyDescription?: string
  onLike?: (pinId: string) => void
  onDelete?: (pinId: string) => void
}

const breakpointColumns = {
  default: 5,
  1280: 4,
  1024: 3,
  640: 2,
}

export function PinGrid({
  pins,
  isLoading,
  emptyMessage = 'No pins yet',
  emptyDescription,
  onLike,
  onDelete,
}: PinGridProps) {
  if (isLoading && pins.length === 0) {
    return <PinGridSkeleton />
  }

  if (!isLoading && pins.length === 0) {
    return (
      <EmptyState
        icon={Pin}
        title={emptyMessage}
        description={emptyDescription}
      />
    )
  }

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {pins.map((pin) => (
        <div key={pin.id} className="mb-4">
          <PinCard pin={pin} onLike={onLike} onDelete={onDelete} />
        </div>
      ))}
    </Masonry>
  )
}
