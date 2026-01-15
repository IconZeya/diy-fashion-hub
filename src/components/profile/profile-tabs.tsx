'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PinGrid } from '@/components/pins/pin-grid'
import { BoardGrid } from '@/components/boards/board-grid'
import { RequestGrid } from '@/components/requests'
import { Sparkles, Heart, FolderHeart, MessageSquarePlus } from 'lucide-react'
import type { PinWithUser, Board, DIYRequestWithUser } from '@/types'

interface ProfileTabsProps {
  pins: PinWithUser[]
  savedPins: PinWithUser[]
  boards: Board[]
  requests: DIYRequestWithUser[]
  isLoading?: boolean
  isOwnProfile?: boolean
}

export function ProfileTabs({
  pins,
  savedPins,
  boards,
  requests,
  isLoading,
  isOwnProfile,
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue="created" className="w-full">
      <TabsList className="mx-auto flex w-fit gap-2 rounded-full border-2 border-pink-200 bg-white/80 p-2 backdrop-blur-sm dark:border-pink-900/50 dark:bg-zinc-900/80">
        <TabsTrigger
          value="created"
          className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-zinc-900 data-[state=active]:to-zinc-800 data-[state=active]:text-pink-400 data-[state=active]:shadow-lg dark:data-[state=active]:from-pink-500 dark:data-[state=active]:to-pink-600 dark:data-[state=active]:text-white"
        >
          <Sparkles className="size-4" />
          Created
        </TabsTrigger>
        <TabsTrigger
          value="saved"
          className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-zinc-900 data-[state=active]:to-zinc-800 data-[state=active]:text-pink-400 data-[state=active]:shadow-lg dark:data-[state=active]:from-pink-500 dark:data-[state=active]:to-pink-600 dark:data-[state=active]:text-white"
        >
          <Heart className="size-4" />
          Saved
        </TabsTrigger>
        <TabsTrigger
          value="boards"
          className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-zinc-900 data-[state=active]:to-zinc-800 data-[state=active]:text-pink-400 data-[state=active]:shadow-lg dark:data-[state=active]:from-pink-500 dark:data-[state=active]:to-pink-600 dark:data-[state=active]:text-white"
        >
          <FolderHeart className="size-4" />
          Boards
        </TabsTrigger>
        <TabsTrigger
          value="requests"
          className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-zinc-900 data-[state=active]:to-zinc-800 data-[state=active]:text-pink-400 data-[state=active]:shadow-lg dark:data-[state=active]:from-pink-500 dark:data-[state=active]:to-pink-600 dark:data-[state=active]:text-white"
        >
          <MessageSquarePlus className="size-4" />
          Requests
        </TabsTrigger>
      </TabsList>

      <TabsContent value="created" className="mt-8">
        <PinGrid
          pins={pins}
          isLoading={isLoading}
          emptyMessage={isOwnProfile ? "You haven't created any pins yet" : 'No pins yet'}
          emptyDescription={
            isOwnProfile
              ? 'Start by creating your first DIY project'
              : undefined
          }
        />
      </TabsContent>

      <TabsContent value="saved" className="mt-8">
        <PinGrid
          pins={savedPins}
          isLoading={isLoading}
          emptyMessage={isOwnProfile ? 'No saved pins yet' : 'No saved pins'}
          emptyDescription={
            isOwnProfile
              ? 'Save pins you love to find them later'
              : undefined
          }
        />
      </TabsContent>

      <TabsContent value="boards" className="mt-8">
        <BoardGrid
          boards={boards}
          isLoading={isLoading}
          emptyMessage={isOwnProfile ? 'No boards yet' : 'No boards'}
          emptyDescription={
            isOwnProfile
              ? 'Create boards to organize your saved pins'
              : undefined
          }
        />
      </TabsContent>

      <TabsContent value="requests" className="mt-8">
        <RequestGrid
          requests={requests}
          isLoading={isLoading}
          emptyMessage={isOwnProfile ? 'No requests yet' : 'No requests'}
          emptyDescription={
            isOwnProfile
              ? 'Ask the community for DIY help and inspiration'
              : undefined
          }
        />
      </TabsContent>
    </Tabs>
  )
}
