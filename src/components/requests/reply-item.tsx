'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MoreHorizontal, Pencil, Reply, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ClickableImage } from '@/components/shared'
import { ReplyForm } from './reply-form'
import { useAuthStore } from '@/stores/auth-store'
import type { RequestReplyWithUser } from '@/types'

interface ReplyItemProps {
  reply: RequestReplyWithUser
  onReply: (data: { content: string; images: string[]; parentReplyId?: string }) => Promise<unknown>
  onDelete: (replyId: string, parentReplyId?: string) => void
  onEdit: (replyId: string, data: { content: string; images: string[] }, parentReplyId?: string) => Promise<unknown>
  isNested?: boolean
}

export function ReplyItem({ reply, onReply, onDelete, onEdit, isNested = false }: ReplyItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { user } = useAuthStore()
  const isOwner = user?.id === reply.user_id

  const handleReply = async (data: { content: string; images: string[] }) => {
    await onReply({ ...data, parentReplyId: reply.id })
    setShowReplyForm(false)
  }

  const handleEdit = async (data: { content: string; images: string[] }) => {
    const result = await onEdit(
      reply.id,
      data,
      isNested ? reply.parent_reply_id || undefined : undefined
    )
    if (result) {
      setIsEditing(false)
    }
  }

  return (
    <div className={`${isNested ? 'ml-8 pl-4 border-l-2 border-muted' : ''}`}>
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between">
          <Link
            href={`/profile/${reply.user.username}`}
            className="flex items-center gap-2 group"
          >
            <Avatar className="size-8">
              <AvatarImage
                src={reply.user.avatar_url || undefined}
                alt={reply.user.display_name || reply.user.username}
              />
              <AvatarFallback className="text-xs">
                {reply.user.display_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-sm font-medium group-hover:underline">
                {reply.user.display_name || reply.user.username}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {!isNested && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="size-3 mr-1" />
                Reply
              </Button>
            )}

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="size-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(reply.id, isNested ? reply.parent_reply_id || undefined : undefined)}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Content or Edit Form */}
        {isEditing ? (
          <div className="mt-2">
            <ReplyForm
              onSubmit={handleEdit}
              initialContent={reply.content}
              initialImages={reply.images || []}
              isEditing
              autoFocus
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <>
            <p className="text-sm whitespace-pre-wrap">
              {reply.content}
              {reply.updated_at !== reply.created_at && (
                <span className="text-xs text-muted-foreground ml-2">(edited)</span>
              )}
            </p>

            {/* Images */}
            {reply.images && reply.images.length > 0 && (
              <div className={`grid gap-2 ${reply.images.length === 1 ? 'grid-cols-1 max-w-sm' : 'grid-cols-2 max-w-md'}`}>
                {reply.images.map((image, index) => (
                  <ClickableImage
                    key={image}
                    src={image}
                    alt={`Reply image ${index + 1}`}
                    images={reply.images}
                    index={index}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-3">
            <ReplyForm
              onSubmit={handleReply}
              placeholder={`Reply to ${reply.user.display_name || reply.user.username}...`}
              autoFocus
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}

        {/* Nested replies */}
        {reply.replies && reply.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {reply.replies.map((nestedReply) => (
              <ReplyItem
                key={nestedReply.id}
                reply={nestedReply}
                onReply={onReply}
                onDelete={onDelete}
                onEdit={onEdit}
                isNested
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
