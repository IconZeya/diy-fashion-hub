'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from './image-upload'
import { pinSchema, type PinInput } from '@/lib/validations/pin'
import { CATEGORIES, DIFFICULTY_LEVELS, TIME_ESTIMATES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { supabaseInsert } from '@/lib/supabase/rest'
import { useAuthStore } from '@/stores/auth-store'

export function PinForm() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [materials, setMaterials] = useState<string[]>([])
  const [materialInput, setMaterialInput] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PinInput>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      difficulty: 'beginner',
      images: [],
      tags: [],
      materials: [],
    },
  })

  const selectedCategory = watch('category')
  const selectedDifficulty = watch('difficulty')
  const selectedTime = watch('estimatedTime')

  async function onSubmit(data: PinInput) {
    // Use form data images (synced via setValue) with fallback to local state
    const submittedImages = data.images.length > 0 ? data.images : images

    if (submittedImages.length === 0) {
      toast.error('Please add at least one image')
      return
    }

    if (!user) {
      toast.error('Please sign in to create a pin')
      router.push('/login')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabaseInsert('pins', {
        user_id: user.id,
        title: data.title,
        description: data.description || null,
        images: submittedImages,
        category: data.category,
        difficulty: data.difficulty || 'beginner',
        estimated_time: data.estimatedTime || null,
        materials: materials || [],
        tags: tags || [],
        external_link: data.externalLink || null,
      })

      if (error) {
        toast.error('Failed to create pin: ' + error.message)
        return
      }

      toast.success('Pin created successfully!')
      router.push('/')
    } catch (error) {
      console.error('Error creating pin:', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const addMaterial = () => {
    const material = materialInput.trim()
    if (material && !materials.includes(material)) {
      setMaterials([...materials, material])
      setMaterialInput('')
    }
  }

  const removeMaterial = (materialToRemove: string) => {
    setMaterials(materials.filter((m) => m !== materialToRemove))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Images */}
      <div className="space-y-2">
        <Label>Images *</Label>
        <ImageUpload
          images={images}
          onChange={(newImages) => {
            setImages(newImages)
            setValue('images', newImages, { shouldValidate: true })
          }}
          disabled={isLoading}
        />
        {errors.images && (
          <p className="text-sm text-destructive">{errors.images.message}</p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Give your DIY project a catchy title"
          disabled={isLoading}
          {...register('title')}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          placeholder="Describe your project, including steps and tips..."
          rows={4}
          disabled={isLoading}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category *</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              disabled={isLoading}
              onClick={() => setValue('category', category.id)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm transition-colors',
                selectedCategory === category.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input hover:border-primary/50'
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <Label>Difficulty Level *</Label>
        <div className="flex gap-2">
          {DIFFICULTY_LEVELS.map((level) => (
            <button
              key={level.id}
              type="button"
              disabled={isLoading}
              onClick={() => setValue('difficulty', level.id as 'beginner' | 'intermediate' | 'advanced')}
              className={cn(
                'rounded-full border px-4 py-2 text-sm transition-colors',
                selectedDifficulty === level.id
                  ? level.color
                  : 'border-input hover:border-primary/50'
              )}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Estimate */}
      <div className="space-y-2">
        <Label>Estimated Time</Label>
        <div className="flex flex-wrap gap-2">
          {TIME_ESTIMATES.map((time) => (
            <button
              key={time.id}
              type="button"
              disabled={isLoading}
              onClick={() => setValue('estimatedTime', time.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm transition-colors',
                selectedTime === time.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input hover:border-primary/50'
              )}
            >
              {time.label}
            </button>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div className="space-y-2">
        <Label>Materials</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add material (e.g., Old t-shirt)"
            value={materialInput}
            onChange={(e) => setMaterialInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addMaterial()
              }
            }}
            disabled={isLoading}
          />
          <Button type="button" variant="outline" onClick={addMaterial}>
            <Plus className="size-4" />
          </Button>
        </div>
        {materials.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {materials.map((material) => (
              <span
                key={material}
                className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
              >
                {material}
                <button
                  type="button"
                  onClick={() => removeMaterial(material)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add tags (e.g., sustainable)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
            disabled={isLoading || tags.length >= 10}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addTag}
            disabled={tags.length >= 10}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-primary/70 hover:text-primary"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">{tags.length}/10 tags</p>
      </div>

      {/* External Link */}
      <div className="space-y-2">
        <Label htmlFor="externalLink">External Link (optional)</Label>
        <Input
          id="externalLink"
          type="url"
          placeholder="https://..."
          disabled={isLoading}
          {...register('externalLink')}
        />
        {errors.externalLink && (
          <p className="text-sm text-destructive">{errors.externalLink.message}</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="animate-spin" />}
          Create Pin
        </Button>
      </div>
    </form>
  )
}
