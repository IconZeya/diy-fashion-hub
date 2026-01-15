'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft, MessageCircle, MoreHorizontal, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ReplyForm, ReplyItem } from '@/components/requests'
import { InfiniteScroll, EmptyState, ClickableImage } from '@/components/shared'
import { useRequest } from '@/hooks/use-requests'
import { useAuthStore } from '@/stores/auth-store'

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string

  const { user } = useAuthStore()
  const {
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
  } = useRequest(requestId)

  const isOwner = user?.id === request?.user_id

  useEffect(() => {
    fetchRequest()
    fetchReplies(true)
  }, [fetchRequest, fetchReplies])

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this request?')) {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        router.push('/requests')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-20 bg-muted rounded" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState
          icon={MessageCircle}
          title="Request not found"
          description="This request may have been deleted or doesn't exist"
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/requests">
          <ArrowLeft className="size-4 mr-2" />
          Back to Requests
        </Link>
      </Button>

      {/* Request */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <Link
            href={`/profile/${request.user.username}`}
            className="flex items-center gap-3 group"
          >
            <Avatar className="size-12">
              <AvatarImage
                src={request.user.avatar_url || undefined}
                alt={request.user.display_name || request.user.username}
              />
              <AvatarFallback>
                {request.user.display_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium group-hover:underline">
                {request.user.display_name || request.user.username}
              </p>
              <p className="text-sm text-muted-foreground">
                @{request.user.username} · {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </p>
            </div>
          </Link>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete Request
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Title & Content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{request.title}</h1>
          <p className="text-muted-foreground whitespace-pre-wrap">{request.content}</p>
        </div>

        {/* Images */}
        {request.images && request.images.length > 0 && (
          <div className={`grid gap-3 ${request.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {request.images.map((image, index) => (
              <ClickableImage
                key={image}
                src={image}
                alt={`${request.title} image ${index + 1}`}
                images={request.images}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Tags */}
        {request.tags && request.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {request.tags.map((tag) => (
              <Link
                key={tag}
                href={`/requests?tag=${encodeURIComponent(tag)}`}
                className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 pt-4 border-t text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageCircle className="size-4" />
            {request.reply_count} {request.reply_count === 1 ? 'reply' : 'replies'}
          </span>
        </div>
      </div>

      {/* Reply form */}
      {user && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-medium mb-3">Leave a reply</h3>
          <ReplyForm
            onSubmit={createReply}
            placeholder="Share your thoughts, tips, or solutions..."
          />
        </div>
      )}

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">
          Replies ({request.reply_count})
        </h2>

        <InfiniteScroll
          hasMore={hasMoreReplies}
          isLoading={isLoadingReplies}
          onLoadMore={() => fetchReplies()}
        >
          {replies.length > 0 ? (
            <div className="space-y-4">
              {replies.map((reply) => (
                <div key={reply.id} className="rounded-xl border bg-card p-4">
                  <ReplyItem
                    reply={reply}
                    onReply={createReply}
                    onDelete={deleteReply}
                    onEdit={editReply}
                  />
                </div>
              ))}
            </div>
          ) : !isLoadingReplies ? (
            <div className="text-center text-muted-foreground py-8">
              No replies yet. Be the first to help!
            </div>
          ) : null}
        </InfiniteScroll>
      </div>
    </div>
  )
}
