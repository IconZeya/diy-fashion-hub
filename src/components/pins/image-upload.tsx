'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImagePlus, Loader2, X } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { IMAGE_UPLOAD_CONFIG, MAX_PIN_IMAGES } from '@/lib/constants'
import { uploadImage } from '@/lib/supabase/storage'
import { toast } from 'sonner'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageUpload({
  images,
  onChange,
  maxImages = MAX_PIN_IMAGES,
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length >= maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`)
        return
      }

      const filesToUpload = acceptedFiles.slice(0, maxImages - images.length)

      setIsUploading(true)

      try {
        const uploadPromises = filesToUpload.map(async (file) => {
          // Validate file size
          if (file.size > IMAGE_UPLOAD_CONFIG.maxSizeMB * 1024 * 1024) {
            toast.error(`File ${file.name} is too large (max ${IMAGE_UPLOAD_CONFIG.maxSizeMB}MB)`)
            return null
          }

          const result = await uploadImage(file, 'PINS')

          if ('error' in result) {
            toast.error(`Failed to upload ${file.name}: ${result.error}`)
            return null
          }

          return result.url
        })

        const uploadedUrls = await Promise.all(uploadPromises)
        const validUrls = uploadedUrls.filter((url): url is string => url !== null)

        if (validUrls.length > 0) {
          onChange([...images, ...validUrls])
          toast.success(`${validUrls.length} image(s) uploaded`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload images')
      } finally {
        setIsUploading(false)
      }
    },
    [images, maxImages, onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg', '.jfif'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/tiff': ['.tiff', '.tif'],
      'image/svg+xml': ['.svg'],
    },
    maxFiles: maxImages - images.length,
    disabled: disabled || isUploading || images.length >= maxImages,
  })

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index)
      onChange(newImages)
    },
    [images, onChange]
  )

  // Prevent hydration mismatch by not rendering dropzone on server
  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 border-muted-foreground/25">
          <ImagePlus className="size-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Uploaded Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <div key={url} className="group relative aspect-square">
              <Image
                src={url}
                alt={`Uploaded image ${index + 1}`}
                fill
                className="rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -right-2 -top-2 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => removeImage(index)}
              >
                <X className="size-3" />
              </Button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            (disabled || isUploading) && 'cursor-not-allowed opacity-50'
          )}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <>
              <Loader2 className="size-10 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <ImagePlus className="size-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {isDragActive
                  ? 'Drop images here'
                  : 'Drag & drop images, or click to select'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {images.length}/{maxImages} images • Max {IMAGE_UPLOAD_CONFIG.maxSizeMB}MB each
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
