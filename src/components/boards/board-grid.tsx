'use client'

import { BoardCard } from './board-card'
import { BoardGridSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { Layout } from 'lucide-react'
import type { Board } from '@/types'

interface BoardGridProps {
  boards: Board[]
  isLoading?: boolean
  emptyMessage?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
}

export function BoardGrid({
  boards,
  isLoading,
  emptyMessage = 'No boards yet',
  emptyDescription,
  emptyAction,
}: BoardGridProps) {
  if (isLoading && boards.length === 0) {
    return <BoardGridSkeleton />
  }

  if (!isLoading && boards.length === 0) {
    return (
      <EmptyState
        icon={Layout}
        title={emptyMessage}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  )
}
