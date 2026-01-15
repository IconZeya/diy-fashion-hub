'use client'

import { cn } from '@/lib/utils'
import { Flame, Globe, Users } from 'lucide-react'

export type FeedFilter = 'discover' | 'following' | 'trending'

interface FeedTabsProps {
  activeTab: FeedFilter
  onTabChange: (tab: FeedFilter) => void
  isAuthenticated?: boolean
}

const tabs = [
  { id: 'following' as const, label: 'Following', icon: Users, requiresAuth: true },
  { id: 'discover' as const, label: 'Discover', icon: Globe, requiresAuth: false },
  { id: 'trending' as const, label: 'Trending', icon: Flame, requiresAuth: false },
]

export function FeedTabs({ activeTab, onTabChange, isAuthenticated = false }: FeedTabsProps) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-full bg-muted p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        const isDisabled = tab.requiresAuth && !isAuthenticated

        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onTabChange(tab.id)}
            disabled={isDisabled}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
              isDisabled && 'cursor-not-allowed opacity-50'
            )}
            title={isDisabled ? 'Sign in to see posts from people you follow' : undefined}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
