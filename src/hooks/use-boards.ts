'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

// Note: Using API routes for authenticated operations
import { useAuthStore } from '@/stores/auth-store'
import type { Board, BoardWithPins, PinWithUser } from '@/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function useBoards(userId?: string) {
  const [boards, setBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { user } = useAuthStore()

  const fetchBoards = useCallback(async () => {
    setIsLoading(true)

    try {
      const params = new URLSearchParams()
      params.append('select', '*')
      params.append('order', 'created_at.desc')

      if (userId) {
        params.append('user_id', `eq.${userId}`)
        // Only show public boards for other users
        if (userId !== user?.id) {
          params.append('is_private', 'eq.false')
        }
      } else if (user) {
        // Show current user's boards
        params.append('user_id', `eq.${user.id}`)
      }

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/boards?${params.toString()}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        console.error('Error fetching boards:', await response.text())
        toast.error('Failed to load boards')
        return
      }

      const data = await response.json()
      setBoards(data as Board[])
    } catch (error) {
      console.error('Error fetching boards:', error)
      toast.error('Failed to load boards')
    } finally {
      setIsLoading(false)
    }
  }, [userId, user])

  const createBoard = useCallback(
    async (input: { title: string; description?: string; isPrivate?: boolean }) => {
      if (!user) {
        toast.error('Please sign in to create boards')
        return null
      }

      // Use API route for authenticated operations
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: input.title,
          description: input.description,
          isPrivate: input.isPrivate || false,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to create board')
        return null
      }

      const { data } = await response.json()
      if (data) {
        setBoards((prev) => [data, ...prev])
      }
      toast.success('Board created')
      return data
    },
    [user]
  )

  const updateBoard = useCallback(
    async (
      boardId: string,
      updates: { title?: string; description?: string; isPrivate?: boolean }
    ) => {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updates.title,
          description: updates.description,
          isPrivate: updates.isPrivate,
        }),
      })

      if (!response.ok) {
        toast.error('Failed to update board')
        return null
      }

      const { data } = await response.json()
      if (data) {
        setBoards((prev) => prev.map((b) => (b.id === boardId ? data : b)))
      }
      toast.success('Board updated')
      return data
    },
    []
  )

  const deleteBoard = useCallback(
    async (boardId: string) => {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        toast.error('Failed to delete board')
        return false
      }

      setBoards((prev) => prev.filter((b) => b.id !== boardId))
      toast.success('Board deleted')
      return true
    },
    []
  )

  const savePinToBoard = useCallback(
    async (boardId: string, pinId: string) => {
      if (!user) {
        toast.error('Please sign in to save pins')
        return false
      }

      const response = await fetch(`/api/boards/${boardId}/pins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinId }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (error.error?.includes('duplicate') || error.error?.includes('already')) {
          toast.error('Pin already saved to this board')
        } else {
          toast.error(error.error || 'Failed to save pin')
        }
        return false
      }

      toast.success('Pin saved to board')
      return true
    },
    [user]
  )

  const removePinFromBoard = useCallback(
    async (boardId: string, pinId: string) => {
      const response = await fetch(`/api/boards/${boardId}/pins?pinId=${pinId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        toast.error('Failed to remove pin')
        return false
      }

      toast.success('Pin removed from board')
      return true
    },
    []
  )

  return {
    boards,
    isLoading,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    savePinToBoard,
    removePinFromBoard,
  }
}

export function useBoard(boardId: string) {
  const [board, setBoard] = useState<BoardWithPins | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchBoard = useCallback(async () => {
    setIsLoading(true)

    try {
      // Fetch board with user
      const boardParams = new URLSearchParams()
      boardParams.append('select', '*, user:profiles!boards_user_id_fkey(*)')
      boardParams.append('id', `eq.${boardId}`)

      const boardResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/boards?${boardParams.toString()}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Accept': 'application/vnd.pgrst.object+json',
          },
        }
      )

      if (!boardResponse.ok) {
        console.error('Error fetching board:', await boardResponse.text())
        setIsLoading(false)
        return
      }

      const boardData = await boardResponse.json()

      // Fetch pins in this board
      const pinsParams = new URLSearchParams()
      pinsParams.append('select', 'pin:pins(*, user:profiles!pins_user_id_fkey(*))')
      pinsParams.append('board_id', `eq.${boardId}`)
      pinsParams.append('order', 'saved_at.desc')

      const pinsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/saved_pins?${pinsParams.toString()}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Accept': 'application/json',
          },
        }
      )

      let pins: PinWithUser[] = []
      if (pinsResponse.ok) {
        const savedPins = await pinsResponse.json()
        pins = savedPins?.map((sp: { pin: PinWithUser }) => sp.pin).filter(Boolean) || []
      }

      setBoard({
        ...boardData,
        pins,
        pinCount: pins.length,
      } as BoardWithPins)
    } catch (error) {
      console.error('Error fetching board:', error)
    } finally {
      setIsLoading(false)
    }
  }, [boardId])

  return {
    board,
    isLoading,
    fetchBoard,
  }
}
