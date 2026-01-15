'use client'

import { RequestCard } from './request-card'
import { EmptyState } from '@/components/shared/empty-state'
import { MessageSquarePlus } from 'lucide-react'
import type { DIYRequestWithUser } from '@/types'

interface RequestGridProps {
  requests: DIYRequestWithUser[]
  isLoading?: boolean
  onDelete?: (id: string) => void
  emptyMessage?: string
  emptyDescription?: string
}

export function RequestGrid({
  requests,
  isLoading,
  onDelete,
  emptyMessage = 'No requests yet',
  emptyDescription,
}: RequestGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4 space-y-3 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-3 w-16 rounded bg-muted" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
            <div className="h-32 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={MessageSquarePlus}
        title={emptyMessage}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} onDelete={onDelete} />
      ))}
    </div>
  )
}
