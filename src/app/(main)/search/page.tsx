'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search as SearchIcon, Users } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PinGrid } from '@/components/pins'
import { BoardGrid } from '@/components/boards'
import { EmptyState } from '@/components/shared/empty-state'
import { PinGridSkeleton } from '@/components/shared/loading-skeleton'
import type { PinWithUser, Board, Profile } from '@/types'

interface SearchResults {
  pins: PinWithUser[]
  boards: Board[]
  users: Profile[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResults>({
    pins: [],
    boards: [],
    users: [],
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function search() {
      if (!query.trim()) {
        setResults({ pins: [], boards: [], users: [] })
        return
      }

      setIsLoading(true)

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`
        )
        const data = await response.json()

        if (data.data) {
          setResults({
            pins: data.data.pins || [],
            boards: data.data.boards || [],
            users: data.data.users || [],
          })
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    search()
  }, [query])

  if (!query.trim()) {
    return (
      <EmptyState
        icon={SearchIcon}
        title="Search for DIY ideas"
        description="Find pins, boards, and creators"
      />
    )
  }

  const totalResults =
    results.pins.length + results.boards.length + results.users.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Search results for &quot;{query}&quot;
        </h1>
        <p className="text-muted-foreground">
          {isLoading ? 'Searching...' : `${totalResults} results found`}
        </p>
      </div>

      <Tabs defaultValue="pins">
        <TabsList>
          <TabsTrigger value="pins">
            Pins ({results.pins.length})
          </TabsTrigger>
          <TabsTrigger value="boards">
            Boards ({results.boards.length})
          </TabsTrigger>
          <TabsTrigger value="users">
            People ({results.users.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pins" className="mt-6">
          {isLoading ? (
            <PinGridSkeleton />
          ) : (
            <PinGrid
              pins={results.pins}
              emptyMessage="No pins found"
              emptyDescription={`Try searching for something else`}
            />
          )}
        </TabsContent>

        <TabsContent value="boards" className="mt-6">
          {isLoading ? (
            <div className="animate-pulse">Loading...</div>
          ) : (
            <BoardGrid
              boards={results.boards}
              emptyMessage="No boards found"
              emptyDescription="Try searching for something else"
            />
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          {isLoading ? (
            <div className="animate-pulse">Loading...</div>
          ) : results.users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description="Try searching for something else"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50"
                >
                  <Avatar className="size-14">
                    <AvatarImage
                      src={user.avatar_url || undefined}
                      alt={user.display_name || user.username}
                    />
                    <AvatarFallback>
                      {user.display_name?.[0]?.toUpperCase() ||
                        user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user.display_name || user.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
