import type { Category } from '@/types'

export const CATEGORIES: Category[] = [
  { id: 'upcycling', label: 'Upcycling', icon: 'Recycle' },
  { id: 'embroidery', label: 'Embroidery', icon: 'Sparkles' },
  { id: 'tie-dye', label: 'Tie-Dye', icon: 'Palette' },
  { id: 'sewing', label: 'Sewing', icon: 'Scissors' },
  { id: 'knitting', label: 'Knitting', icon: 'Grip' },
  { id: 'accessories', label: 'Accessories', icon: 'Gem' },
  { id: 'alterations', label: 'Alterations', icon: 'Ruler' },
  { id: 'printing', label: 'Printing', icon: 'Stamp' },
  { id: 'jewelry', label: 'Jewelry', icon: 'Diamond' },
  { id: 'bags', label: 'Bags & Purses', icon: 'ShoppingBag' },
]

export const DIFFICULTY_LEVELS = [
  { id: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { id: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-800' },
] as const

export const TIME_ESTIMATES = [
  { id: '15min', label: '< 15 minutes' },
  { id: '30min', label: '15-30 minutes' },
  { id: '1hour', label: '30 min - 1 hour' },
  { id: '2hours', label: '1-2 hours' },
  { id: '3hours', label: '2-3 hours' },
  { id: 'halfday', label: '3-5 hours' },
  { id: 'fullday', label: '5+ hours' },
  { id: 'multiday', label: 'Multiple days' },
] as const

export const FEED_PAGE_SIZE = 20
export const SEARCH_DEBOUNCE_MS = 300
export const MAX_PIN_IMAGES = 5
export const MAX_TAGS = 10

export const IMAGE_UPLOAD_CONFIG = {
  maxSizeMB: 5,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
}

export const STORAGE_BUCKETS = {
  PINS: 'pins',
  AVATARS: 'avatars',
  COVERS: 'covers',
} as const
