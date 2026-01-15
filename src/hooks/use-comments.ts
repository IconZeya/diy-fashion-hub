'use client'

import { useState, useCallback } from 'react'
import type { CommentWithUser } from '@/types'

interface UseCommentsReturn {
  comments: CommentWithUser[]
  isLoading: boolean
  hasMore: boolean
  totalCount: number
  fetchComments: (reset?: boolean) => Promise<void>
  addComment: (content: string) => Promise<boolean>
  deleteComment: (commentId: string) => Promise<boolean>
  loadMore: () => void
}

const COMMENTS_PER_PAGE = 10

export function useComments(pinId: string): UseCommentsReturn {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchComments = useCallback(async (reset = false) => {
    if (isLoading) return

    setIsLoading(true)
    const currentPage = reset ? 1 : page

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(COMMENTS_PER_PAGE),
      })

      const response = await fetch(`/api/pins/${pinId}/comments?${params}`)
      const data = await response.json()

      if (data.error) {
        console.error('Comments error:', data.error)
        return
      }

      const newComments = data.data || []
      setTotalCount(data.pagination?.total || 0)

      if (reset) {
        setComments(newComments)
        setPage(2)
      } else {
        setComments((prev) => [...prev, ...newComments])
        setPage(currentPage + 1)
      }

      setHasMore(newComments.length === COMMENTS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, page, pinId])

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchComments()
    }
  }, [hasMore, isLoading, fetchComments])

  const addComment = useCallback(async (content: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/pins/${pinId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        console.error('Add comment error:', data.error)
        return false
      }

      // Add new comment to the top of the list
      setComments((prev) => [data.data, ...prev])
      setTotalCount((prev) => prev + 1)
      return true
    } catch (error) {
      console.error('Error adding comment:', error)
      return false
    }
  }, [pinId])

  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/pins/${pinId}/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        console.error('Delete comment error:', data.error)
        return false
      }

      // Remove comment from list
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      setTotalCount((prev) => prev - 1)
      return true
    } catch (error) {
      console.error('Error deleting comment:', error)
      return false
    }
  }, [pinId])

  return {
    comments,
    isLoading,
    hasMore,
    totalCount,
    fetchComments,
    addComment,
    deleteComment,
    loadMore,
  }
}
