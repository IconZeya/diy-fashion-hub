'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useComments } from '@/hooks/use-comments'
import { useAuthStore } from '@/stores/auth-store'
import { CommentForm } from './comment-form'
import { CommentCard } from './comment-card'

interface CommentSectionProps {
  pinId: string
}

export function CommentSection({ pinId }: CommentSectionProps) {
  const { user } = useAuthStore()
  const {
    comments,
    isLoading,
    hasMore,
    totalCount,
    fetchComments,
    addComment,
    deleteComment,
    loadMore,
  } = useComments(pinId)

  useEffect(() => {
    fetchComments(true)
  }, [pinId])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="size-5" />
        <h3 className="font-semibold">
          Comments {totalCount > 0 && `(${totalCount})`}
        </h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <CommentForm onSubmit={addComment} />
      ) : (
        <div className="rounded-lg border bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>{' '}
            to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="divide-y">
        {isLoading && comments.length === 0 ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-3">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No comments yet</p>
            <p className="text-sm">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              isOwner={user?.id === comment.user_id}
              onDelete={deleteComment}
            />
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && comments.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load more comments'}
          </Button>
        </div>
      )}
    </div>
  )
}
