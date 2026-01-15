import { z } from 'zod'

export const boardSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(50, 'Title must be at most 50 characters'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  isPrivate: z.boolean().default(false),
  coverUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export type BoardInput = z.infer<typeof boardSchema>
