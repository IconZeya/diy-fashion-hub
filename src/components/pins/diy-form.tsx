'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImagePlus, Loader2, Plus, X, DollarSign } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { uploadImage } from '@/lib/supabase/storage'
import { supabaseInsert } from '@/lib/supabase/rest'
import { IMAGE_UPLOAD_CONFIG } from '@/lib/constants'

interface DIYFormProps {
  pinId: string
  onSuccess?: () => void
}

const TECHNIQUE_SUGGESTIONS = [
  'Hand-sewn',
  'Machine-sewn',
  'Embroidered',
  'Tie-dye',
  'Bleached',
  'Painted',
  'Patched',
  'Knitted',
  'Crocheted',
  'Screen-printed',
]

export function DIYForm({ pinId, onSuccess }: DIYFormProps) {
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [fabrics, setFabrics] = useState<string[]>([])
  const [fabricInput, setFabricInput] = useState('')
  const [techniques, setTechniques] = useState<string[]>([])
  const [isForSale, setIsForSale] = useState(false)
  const [price, setPrice] = useState('')
  const [contactInfo, setContactInfo] = useState('')

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]

      if (file.size > IMAGE_UPLOAD_CONFIG.maxSizeMB * 1024 * 1024) {
        toast.error(`File is too large (max ${IMAGE_UPLOAD_CONFIG.maxSizeMB}MB)`)
        return
      }

      setIsUploading(true)

      try {
        const result = await uploadImage(file, 'PINS', 'diy')

        if ('error' in result) {
          toast.error('Failed to upload image: ' + result.error)
          return
        }

        setImageUrl(result.url)
        toast.success('Image uploaded!')
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload image')
      } finally {
        setIsUploading(false)
      }
    },
    []
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    disabled: isUploading || isSubmitting,
  })

  const addFabric = () => {
    const fabric = fabricInput.trim()
    if (fabric && !fabrics.includes(fabric)) {
      setFabrics([...fabrics, fabric])
      setFabricInput('')
    }
  }

  const removeFabric = (fabric: string) => {
    setFabrics(fabrics.filter((f) => f !== fabric))
  }

  const addTechnique = (technique: string) => {
    if (!techniques.includes(technique)) {
      setTechniques([...techniques, technique])
    }
  }

  const removeTechnique = (technique: string) => {
    setTechniques(techniques.filter((t) => t !== technique))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Please sign in to share your DIY')
      return
    }

    if (!imageUrl) {
      toast.error('Please upload an image of your DIY creation')
      return
    }

    if (isForSale && !price) {
      toast.error('Please set a price for your item')
      return
    }

    if (isForSale && !contactInfo) {
      toast.error('Please add contact info for buyers')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabaseInsert('recreations', {
        pin_id: pinId,
        user_id: user.id,
        image_url: imageUrl,
        description: description || null,
        fabrics,
        techniques,
        is_for_sale: isForSale,
        price: isForSale ? parseFloat(price) : null,
        contact_info: isForSale ? contactInfo : null,
      })

      if (error) {
        toast.error('Failed to share DIY: ' + error.message)
        return
      }

      toast.success(isForSale ? 'Your DIY is now listed for sale!' : 'Your DIY has been shared!')
      resetForm()
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting DIY:', error)
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setImageUrl(null)
    setDescription('')
    setFabrics([])
    setTechniques([])
    setIsForSale(false)
    setPrice('')
    setContactInfo('')
    setIsOpen(false)
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-muted-foreground">
          Sign in to share your DIY creation or sell your handmade fashion
        </p>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full">
        <Plus className="mr-2 size-4" />
        Share Your DIY Creation
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Share Your DIY Creation</h4>
        <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
          <X className="size-4" />
        </Button>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Photo of Your Creation *</Label>
        {imageUrl ? (
          <div className="relative aspect-square w-full max-w-[200px]">
            <Image
              src={imageUrl}
              alt="Your DIY"
              fill
              className="rounded-lg object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 size-6"
              onClick={() => setImageUrl(null)}
            >
              <X className="size-3" />
            </Button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
              isUploading && 'cursor-not-allowed opacity-50'
            )}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <>
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <ImagePlus className="size-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Drop your photo here or click to select
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="diy-description">Description</Label>
        <textarea
          id="diy-description"
          placeholder="Tell us about your creation... any tips or changes you made?"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Fabrics/Materials */}
      <div className="space-y-2">
        <Label>Fabrics & Materials Used</Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Cotton, Denim, Silk..."
            value={fabricInput}
            onChange={(e) => setFabricInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addFabric()
              }
            }}
            disabled={isSubmitting}
          />
          <Button type="button" variant="outline" onClick={addFabric} disabled={isSubmitting}>
            <Plus className="size-4" />
          </Button>
        </div>
        {fabrics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {fabrics.map((fabric) => (
              <span
                key={fabric}
                className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
              >
                {fabric}
                <button type="button" onClick={() => removeFabric(fabric)}>
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Techniques */}
      <div className="space-y-2">
        <Label>Techniques Used</Label>
        <div className="flex flex-wrap gap-2">
          {TECHNIQUE_SUGGESTIONS.filter((t) => !techniques.includes(t)).map((technique) => (
            <button
              key={technique}
              type="button"
              onClick={() => addTechnique(technique)}
              disabled={isSubmitting}
              className="rounded-full border border-input px-3 py-1 text-sm transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              + {technique}
            </button>
          ))}
        </div>
        {techniques.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {techniques.map((technique) => (
              <span
                key={technique}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
              >
                {technique}
                <button type="button" onClick={() => removeTechnique(technique)}>
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* For Sale Toggle */}
      <div className="border-t pt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isForSale}
            onChange={(e) => setIsForSale(e.target.checked)}
            className="size-4 rounded border-input"
            disabled={isSubmitting}
          />
          <div>
            <span className="font-medium">List for Sale</span>
            <p className="text-sm text-muted-foreground">Sell your handmade creation</p>
          </div>
        </label>
      </div>

      {/* Price & Contact (shown when for sale) */}
      {isForSale && (
        <div className="space-y-4 rounded-lg bg-muted/50 p-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isSubmitting}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Info *</Label>
            <Input
              id="contact"
              placeholder="Email, Instagram, or phone number"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              This will be shown to interested buyers
            </p>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !imageUrl}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isForSale ? 'List for Sale' : 'Share DIY'}
        </Button>
      </div>
    </form>
  )
}
