import { z } from 'zod'

export const pinSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters'),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  images: z
    .array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image is required')
    .max(5, 'Maximum 5 images allowed'),
  category: z.string().min(1, 'Please select a category'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    message: 'Please select a difficulty level',
  }),
  estimatedTime: z.string().optional(),
  materials: z.array(z.string()).optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  externalLink: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be at most 500 characters'),
})

export type PinInput = z.infer<typeof pinSchema>
export type CommentInput = z.infer<typeof commentSchema>
