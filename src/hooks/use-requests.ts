'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

import { useAuthStore } from '@/stores/auth-store'
import type { DIYRequestWithUser, RequestReplyWithUser } from '@/types'

const REQUESTS_PER_PAGE = 20

interface UseRequestsOptions {
  search?: string
  tag?: string
}

export function useRequests(options: UseRequestsOptions = {}) {
  const [requests, setRequests] = useState<DIYRequestWithUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const { user } = useAuthStore()

  const fetchRequests = useCallback(
    async (reset = false) => {
      if (isLoading) return

      const currentPage = reset ? 0 : page
      setIsLoading(true)

      try {
        const params = new URLSearchParams()
        params.append('page', String(currentPage + 1))
        params.append('limit', String(REQUESTS_PER_PAGE))
        if (options.search) params.append('search', options.search)
        if (options.tag) params.append('tag', options.tag)

        const response = await fetch(`/api/requests?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch requests')
        }

        const contentType = response.headers.get('content-type')
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid response format')
        }

        const result = await response.json()

        if (reset) {
          setRequests(result.data)
        } else {
          setRequests((prev) => [...prev, ...result.data])
        }

        setHasMore(result.data.length === REQUESTS_PER_PAGE)
        setPage(currentPage + 1)
      } catch (error) {
        console.error('Error fetching requests:', error)
        toast.error('Failed to load requests')
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, page, options.search, options.tag]
  )

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchRequests()
    }
  }, [hasMore, isLoading, fetchRequests])

  const createRequest = useCallback(
    async (data: { title: string; content: string; tags?: string[]; images?: string[] }) => {
      if (!user) {
        toast.error('Please sign in to create a request')
        return null
      }

      try {
        const response = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create request')
        }

        const newRequest = await response.json()
        setRequests((prev) => [newRequest, ...prev])
        toast.success('Request created!')
        return newRequest
      } catch (error) {
        console.error('Error creating request:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to create request')
        return null
      }
    },
    [user]
  )

  const deleteRequest = useCallback(
    async (requestId: string) => {
      try {
        const response = await fetch(`/api/requests/${requestId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete request')
        }

        setRequests((prev) => prev.filter((r) => r.id !== requestId))
        toast.success('Request deleted')
        return true
      } catch (error) {
        console.error('Error deleting request:', error)
        toast.error('Failed to delete request')
        return false
      }
    },
    []
  )

  return {
    requests,
    isLoading,
    hasMore,
    fetchRequests,
    loadMore,
    createRequest,
    deleteRequest,
  }
}

export function useRequest(requestId: string) {
  const [request, setRequest] = useState<DIYRequestWithUser | null>(null)
  const [replies, setReplies] = useState<RequestReplyWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  const [hasMoreReplies, setHasMoreReplies] = useState(true)
  const [repliesPage, setRepliesPage] = useState(0)

  const { user } = useAuthStore()

  // Use refs to avoid infinite loops in callbacks
  const isLoadingRepliesRef = useRef(false)
  const repliesPageRef = useRef(0)

  const fetchRequest = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/requests/${requestId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch request')
      }
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format')
      }
      const data = await response.json()
      setRequest(data)
    } catch (error) {
      console.error('Error fetching request:', error)
    } finally {
      setIsLoading(false)
    }
  }, [requestId])

  const fetchReplies = useCallback(
    async (reset = false) => {
      if (isLoadingRepliesRef.current) return

      const currentPage = reset ? 0 : repliesPageRef.current
      isLoadingRepliesRef.current = true
      setIsLoadingReplies(true)

      try {
        const params = new URLSearchParams()
        params.append('page', String(currentPage + 1))

        const response = await fetch(`/api/requests/${requestId}/replies?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch replies')
        }

        const contentType = response.headers.get('content-type')
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid response format')
        }

        const result = await response.json()

        if (reset) {
          setReplies(result.data)
          repliesPageRef.current = 1
        } else {
          setReplies((prev) => [...prev, ...result.data])
          repliesPageRef.current = currentPage + 1
        }

        setRepliesPage(repliesPageRef.current)
        setHasMoreReplies(result.pagination.page < result.pagination.totalPages)
      } catch (error) {
        console.error('Error fetching replies:', error)
      } finally {
        isLoadingRepliesRef.current = false
        setIsLoadingReplies(false)
      }
    },
    [requestId]
  )

  const createReply = useCallback(
    async (data: { content: string; images?: string[]; parentReplyId?: string }) => {
      if (!user) {
        toast.error('Please sign in to reply')
        return null
      }

      try {
        const response = await fetch(`/api/requests/${requestId}/replies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create reply')
        }

        const newReply = await response.json()

        // Add to replies list (handle nested replies)
        if (data.parentReplyId) {
          setReplies((prev) =>
            prev.map((r) =>
              r.id === data.parentReplyId
                ? { ...r, replies: [...(r.replies || []), newReply] }
                : r
            )
          )
        } else {
          setReplies((prev) => [...prev, { ...newReply, replies: [] }])
        }

        // Update reply count
        if (request) {
          setRequest({ ...request, reply_count: request.reply_count + 1 })
        }

        toast.success('Reply posted!')
        return newReply
      } catch (error) {
        console.error('Error creating reply:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to post reply')
        return null
      }
    },
    [user, requestId, request]
  )

  const deleteReply = useCallback(
    async (replyId: string, parentReplyId?: string) => {
      try {
        const response = await fetch(`/api/requests/${requestId}/replies/${replyId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete reply')
        }

        // Remove from replies list
        if (parentReplyId) {
          setReplies((prev) =>
            prev.map((r) =>
              r.id === parentReplyId
                ? { ...r, replies: (r.replies || []).filter((nr) => nr.id !== replyId) }
                : r
            )
          )
        } else {
          setReplies((prev) => prev.filter((r) => r.id !== replyId))
        }

        // Update reply count
        if (request) {
          setRequest({ ...request, reply_count: Math.max(0, request.reply_count - 1) })
        }

        toast.success('Reply deleted')
        return true
      } catch (error) {
        console.error('Error deleting reply:', error)
        toast.error('Failed to delete reply')
        return false
      }
    },
    [requestId, request]
  )

  const editReply = useCallback(
    async (replyId: string, data: { content: string; images?: string[] }, parentReplyId?: string) => {
      if (!user) {
        toast.error('Please sign in to edit')
        return null
      }

      try {
        const response = await fetch(`/api/requests/${requestId}/replies/${replyId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to edit reply')
        }

        const updatedReply = await response.json()

        // Update in replies list (handle nested replies)
        if (parentReplyId) {
          setReplies((prev) =>
            prev.map((r) =>
              r.id === parentReplyId
                ? {
                    ...r,
                    replies: (r.replies || []).map((nr) =>
                      nr.id === replyId ? { ...nr, ...updatedReply } : nr
                    ),
                  }
                : r
            )
          )
        } else {
          setReplies((prev) =>
            prev.map((r) => (r.id === replyId ? { ...r, ...updatedReply } : r))
          )
        }

        toast.success('Reply updated!')
        return updatedReply
      } catch (error) {
        console.error('Error editing reply:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to edit reply')
        return null
      }
    },
    [user, requestId]
  )

  return {
    request,
    replies,
    isLoading,
    isLoadingReplies,
    hasMoreReplies,
    fetchRequest,
    fetchReplies,
    createReply,
    deleteReply,
    editReply,
  }
}
