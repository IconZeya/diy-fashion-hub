'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { uploadImage } from '@/lib/supabase/storage'

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be at most 50 characters'),
  bio: z.string().max(160, 'Bio must be at most 160 characters').optional(),
})

type ProfileInput = z.infer<typeof profileSchema>

export function EditProfileForm() {
  const router = useRouter()
  const { profile, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.display_name || '',
      bio: profile?.bio || '',
    },
  })

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  async function onSubmit(data: ProfileInput) {
    setIsLoading(true)

    try {
      let avatarUrl = profile?.avatar_url

      // Upload new avatar if changed
      if (avatarFile) {
        const result = await uploadImage(avatarFile, 'AVATARS')
        if ('error' in result) {
          toast.error('Failed to upload avatar')
          setIsLoading(false)
          return
        }
        avatarUrl = result.url
      }

      await updateProfile({
        display_name: data.displayName,
        bio: data.bio || null,
        avatar_url: avatarUrl,
      })

      router.push(`/profile/${profile?.username}`)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-xl">
      {/* Avatar */}
      <div className="space-y-4">
        <Label>Profile Photo</Label>
        <div className="flex items-center gap-4">
          <Avatar className="size-24">
            <AvatarImage
              src={avatarPreview || profile?.avatar_url || undefined}
              alt={profile?.display_name || 'Avatar'}
            />
            <AvatarFallback className="text-2xl">
              {profile?.display_name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button type="button" variant="outline" asChild>
              <label className="cursor-pointer">
                Change photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isLoading}
                />
              </label>
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG or WebP. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          placeholder="Your name"
          disabled={isLoading}
          {...register('displayName')}
          aria-invalid={!!errors.displayName}
        />
        {errors.displayName && (
          <p className="text-sm text-destructive">{errors.displayName.message}</p>
        )}
      </div>

      {/* Username (read-only) */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={profile?.username || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Username cannot be changed
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          placeholder="Tell others about yourself..."
          rows={3}
          disabled={isLoading}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register('bio')}
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
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
          Save changes
        </Button>
      </div>
    </form>
  )
}
