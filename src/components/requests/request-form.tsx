'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/stores/auth-store'

interface RequestFormProps {
  onSubmit: (data: { title: string; content: string; tags: string[]; images: string[] }) => Promise<unknown>
  onCancel?: () => void
  isExpanded?: boolean
}

export function RequestForm({ onSubmit, onCancel, isExpanded = false }: RequestFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [expanded, setExpanded] = useState(isExpanded)
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
        formData.append('bucket', 'PINS') // Reuse pins bucket for request images

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
      toast.error('Please sign in to create a request')
      return
    }

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required')
      return
    }

    setIsSubmitting(true)
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)

      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        tags,
        images,
      })

      // Reset form
      setTitle('')
      setContent('')
      setTagsInput('')
      setImages([])
      setExpanded(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full rounded-xl border bg-card p-4 text-left text-muted-foreground hover:border-primary/50 transition-colors"
      >
        Ask a DIY question or make a request...
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-4 space-y-4">
      <Input
        placeholder="Title - What do you need help with?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg font-medium"
        maxLength={200}
      />

      <Textarea
        placeholder="Describe your request in detail. What are you trying to make? What help do you need?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        maxLength={2000}
      />

      <Input
        placeholder="Tags (comma separated, e.g., sewing, upcycling, beginner)"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
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
              <div key={image} className="relative size-20 rounded-lg overflow-hidden group">
                <Image src={image} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 size-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < 5 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <ImagePlus className="size-4 mr-2" />
            )}
            Add Images
          </Button>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setExpanded(false)
            onCancel?.()
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            'Post Request'
          )}
        </Button>
      </div>
    </form>
  )
}
