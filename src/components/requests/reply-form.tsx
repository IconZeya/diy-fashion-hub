'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, X, Send } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/stores/auth-store'

interface ReplyFormProps {
  onSubmit: (data: { content: string; images: string[]; parentReplyId?: string }) => Promise<unknown>
  parentReplyId?: string
  placeholder?: string
  autoFocus?: boolean
  onCancel?: () => void
  initialContent?: string
  initialImages?: string[]
  isEditing?: boolean
}

export function ReplyForm({
  onSubmit,
  parentReplyId,
  placeholder = 'Write a reply...',
  autoFocus = false,
  onCancel,
  initialContent = '',
  initialImages = [],
  isEditing = false,
}: ReplyFormProps) {
  const [content, setContent] = useState(initialContent)
  const [images, setImages] = useState<string[]>(initialImages)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user } = useAuthStore()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('bucket', 'PINS')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const { url } = await response.json()
        setImages((prev) => [...prev, url])
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Please sign in to reply')
      return
    }

    if (!content.trim()) {
      toast.error('Reply content is required')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        content: content.trim(),
        images,
        parentReplyId,
      })

      // Reset form
      setContent('')
      setImages([])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={2000}
        autoFocus={autoFocus}
      />

      {/* Image upload */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />

        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={image} className="relative size-16 rounded-lg overflow-hidden group">
                <Image src={image} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 size-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || images.length >= 5}
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
        </Button>

        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !content.trim()}
          className="ml-auto"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Send className="size-4 mr-1" />
              {isEditing ? 'Save' : 'Reply'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
