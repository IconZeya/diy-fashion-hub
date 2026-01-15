'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CommentFormProps {
  onSubmit: (content: string) => Promise<boolean>
  isDisabled?: boolean
  placeholder?: string
}

export function CommentForm({
  onSubmit,
  isDisabled = false,
  placeholder = 'Add a comment...',
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedContent = content.trim()
    if (!trimmedContent || isSubmitting) return

    setIsSubmitting(true)
    const success = await onSubmit(trimmedContent)

    if (success) {
      setContent('')
    }
    setIsSubmitting(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isDisabled || isSubmitting}
        className="min-h-[80px] resize-none"
        maxLength={500}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!content.trim() || isDisabled || isSubmitting}
        className="shrink-0"
      >
        <Send className="size-4" />
        <span className="sr-only">Send comment</span>
      </Button>
    </form>
  )
}
