'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PinGrid } from '@/components/pins'
import { BoardGridSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { Layout } from 'lucide-react'
import { useBoard, useBoards } from '@/hooks/use-boards'
import { useAuthStore } from '@/stores/auth-store'
import type { PinWithUser } from '@/types'

export default function BoardPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.id as string

  const { board, isLoading, fetchBoard } = useBoard(boardId)
  const { deleteBoard } = useBoards()
  const { user } = useAuthStore()

  const isOwner = user?.id === board?.user_id

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this board?')) {
      const success = await deleteBoard(boardId)
      if (success) {
        router.push(`/profile/${board?.user?.username}`)
      }
    }
  }

  if (isLoading) {
    return <BoardGridSkeleton />
  }

  if (!board) {
    return (
      <EmptyState
        icon={Layout}
        title="Board not found"
        description="This board may have been deleted or is private"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/profile/${board.user?.username}`}>
          <ArrowLeft className="size-4" />
          Back to profile
        </Link>
      </Button>

      {/* Board Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{board.title}</h1>
            {board.is_private && (
              <Lock className="size-5 text-muted-foreground" />
            )}
          </div>
          {board.description && (
            <p className="mt-2 text-muted-foreground">{board.description}</p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {board.pinCount} {board.pinCount === 1 ? 'pin' : 'pins'}
          </p>

          {/* Creator */}
          {board.user && (
            <Link
              href={`/profile/${board.user.username}`}
              className="mt-4 flex items-center gap-2 group"
            >
              <Avatar className="size-8">
                <AvatarImage
                  src={board.user.avatar_url || undefined}
                  alt={board.user.display_name || board.user.username}
                />
                <AvatarFallback>
                  {board.user.display_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm group-hover:underline">
                {board.user.display_name || board.user.username}
              </span>
            </Link>
          )}
        </div>

        {/* Actions */}
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Pencil className="size-4" />
                Edit board
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="size-4" />
                Delete board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Pins */}
      <PinGrid
        pins={(board.pins as PinWithUser[]) || []}
        emptyMessage="No pins in this board yet"
        emptyDescription={
          isOwner ? 'Save some pins to get started' : undefined
        }
      />
    </div>
  )
}
