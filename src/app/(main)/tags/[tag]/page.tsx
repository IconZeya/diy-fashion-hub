'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Hash } from 'lucide-react'
import { PinGrid } from '@/components/pins'
import { InfiniteScroll } from '@/components/shared/infinite-scroll'
import type { PinWithUser } from '@/types'

const PINS_PER_PAGE = 20

export default function TagPage() {
  const params = useParams()
  const tag = decodeURIComponent(params.tag as string)

  const [pins, setPins] = useState<PinWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchPins = useCallback(async (reset = false) => {
    if (isLoading && !reset) return

    setIsLoading(true)
    const currentPage = reset ? 1 : page

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PINS_PER_PAGE),
      })

      const response = await fetch(`/api/tags/${encodeURIComponent(tag)}?${params}`)
      const data = await response.json()

      if (data.error) {
        console.error('Tag fetch error:', data.error)
        return
      }

      setTotalCount(data.pagination?.total || 0)

      if (reset) {
        setPins(data.data || [])
        setPage(2)
      } else {
        setPins((prev) => [...prev, ...(data.data || [])])
        setPage(currentPage + 1)
      }

      setHasMore((data.data?.length || 0) === PINS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching tag pins:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, page, tag])

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchPins()
    }
  }, [hasMore, isLoading, fetchPins])

  useEffect(() => {
    fetchPins(true)
  }, [tag])

  return (
    <div className="space-y-6">
      {/* Tag Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 text-3xl font-bold">
          <Hash className="size-8 text-primary" />
          <span>{tag}</span>
        </div>
        <p className="text-muted-foreground mt-2">
          {totalCount} {totalCount === 1 ? 'pin' : 'pins'}
        </p>
      </div>

      {/* Pin Grid */}
      <InfiniteScroll
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={loadMore}
      >
        <PinGrid
          pins={pins}
          isLoading={isLoading && pins.length === 0}
          emptyMessage={`No pins tagged with #${tag}`}
          emptyDescription="Be the first to create a pin with this tag!"
        />
      </InfiniteScroll>
    </div>
  )
}
