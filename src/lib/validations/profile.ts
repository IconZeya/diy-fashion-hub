import { z } from 'zod'

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be at most 50 characters')
    .optional(),
  bio: z.string().max(300, 'Bio must be at most 300 characters').optional(),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  coverUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export type ProfileInput = z.infer<typeof profileSchema>
