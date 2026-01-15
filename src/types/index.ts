import type { Database, DifficultyLevel } from './database'

// Table row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Board = Database['public']['Tables']['boards']['Row']
export type Pin = Database['public']['Tables']['pins']['Row']
export type SavedPin = Database['public']['Tables']['saved_pins']['Row']
export type Like = Database['public']['Tables']['likes']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type DIYCreation = Database['public']['Tables']['recreations']['Row']

// View types
export type ProfileStats = Database['public']['Views']['profile_stats']['Row']

// Extended types with relations
export interface ProfileWithStats extends Profile {
  stats?: ProfileStats
}

export interface PinWithUser extends Pin {
  user: Profile
}

export interface PinWithDetails extends PinWithUser {
  isLiked?: boolean
  isSaved?: boolean
}

export interface BoardWithUser extends Board {
  user: Profile
}

export interface BoardWithPins extends Board {
  pins: Pin[]
  pinCount: number
}

export interface CommentWithUser extends Comment {
  user: Profile
}

export interface DIYCreationWithUser extends DIYCreation {
  user: Profile
}

// Input types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type BoardInsert = Database['public']['Tables']['boards']['Insert']
export type BoardUpdate = Database['public']['Tables']['boards']['Update']
export type PinInsert = Database['public']['Tables']['pins']['Insert']
export type PinUpdate = Database['public']['Tables']['pins']['Update']

// Re-export
export type { Database, DifficultyLevel }

// Category type
export interface Category {
  id: string
  label: string
  icon: string
}

// API response types
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  error: string
  code?: string
  details?: Record<string, unknown>
}

// DIY Requests types
export interface DIYRequest {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  images: string[]
  reply_count: number
  created_at: string
  updated_at: string
}

export interface DIYRequestWithUser extends DIYRequest {
  user: Profile
}

export interface RequestReply {
  id: string
  request_id: string
  user_id: string
  parent_reply_id: string | null
  content: string
  images: string[]
  created_at: string
  updated_at: string
}

export interface RequestReplyWithUser extends RequestReply {
  user: Profile
  replies?: RequestReplyWithUser[]
}
