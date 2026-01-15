export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          cover_url: string | null
          password_hash: string | null
          auth_provider: string
          google_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          password_hash?: string | null
          auth_provider?: string
          google_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          password_hash?: string | null
          auth_provider?: string
          google_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      boards: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          cover_url: string | null
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          cover_url?: string | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          cover_url?: string | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pins: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          images: string[]
          materials: string[]
          difficulty: DifficultyLevel
          estimated_time: string | null
          category: string | null
          tags: string[]
          external_link: string | null
          like_count: number
          save_count: number
          comment_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          images?: string[]
          materials?: string[]
          difficulty?: DifficultyLevel
          estimated_time?: string | null
          category?: string | null
          tags?: string[]
          external_link?: string | null
          like_count?: number
          save_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          images?: string[]
          materials?: string[]
          difficulty?: DifficultyLevel
          estimated_time?: string | null
          category?: string | null
          tags?: string[]
          external_link?: string | null
          like_count?: number
          save_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      saved_pins: {
        Row: {
          id: string
          board_id: string
          pin_id: string
          saved_at: string
        }
        Insert: {
          id?: string
          board_id: string
          pin_id: string
          saved_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          pin_id?: string
          saved_at?: string
        }
      }
      likes: {
        Row: {
          user_id: string
          pin_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          pin_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          pin_id?: string
          created_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          pin_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pin_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pin_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      recreations: {
        Row: {
          id: string
          pin_id: string
          user_id: string
          image_url: string
          description: string | null
          fabrics: string[]
          techniques: string[]
          price: number | null
          is_for_sale: boolean
          contact_info: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pin_id: string
          user_id: string
          image_url: string
          description?: string | null
          fabrics?: string[]
          techniques?: string[]
          price?: number | null
          is_for_sale?: boolean
          contact_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pin_id?: string
          user_id?: string
          image_url?: string
          description?: string | null
          fabrics?: string[]
          techniques?: string[]
          price?: number | null
          is_for_sale?: boolean
          contact_info?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      profile_stats: {
        Row: {
          id: string
          follower_count: number
          following_count: number
          pin_count: number
          board_count: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty_level: DifficultyLevel
    }
  }
}
