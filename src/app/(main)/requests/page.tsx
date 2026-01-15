'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RequestCard, RequestForm } from '@/components/requests'
import { InfiniteScroll } from '@/components/shared/infinite-scroll'
import { EmptyState } from '@/components/shared/empty-state'
import { useRequests } from '@/hooks/use-requests'
import { useAuthStore } from '@/stores/auth-store'
import { MessageCircle } from 'lucide-react'

export default function RequestsPage() {
  const searchParams = useSearchParams()
  const tagParam = searchParams.get('tag') || ''

  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [activeTag, setActiveTag] = useState(tagParam)

  const { user } = useAuthStore()
  const {
    requests,
    isLoading,
    hasMore,
    fetchRequests,
    loadMore,
    createRequest,
    deleteRequest,
  } = useRequests({ search: activeSearch, tag: activeTag })

  useEffect(() => {
    fetchRequests(true)
  }, [activeSearch, activeTag])

  useEffect(() => {
    if (tagParam !== activeTag) {
      setActiveTag(tagParam)
    }
  }, [tagParam])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveSearch(searchQuery)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setActiveSearch('')
  }

  const clearTag = () => {
    setActiveTag('')
    // Update URL without tag
    window.history.pushState({}, '', '/requests')
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      await deleteRequest(id)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">DIY Requests</h1>
          <p className="text-muted-foreground">
            Ask questions, request help, and share ideas with the community
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="size-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <Button type="submit">Search</Button>
        </form>

        {/* Active filters */}
        {(activeSearch || activeTag) && (
          <div className="flex flex-wrap gap-2">
            {activeSearch && (
              <div className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm">
                Search: "{activeSearch}"
                <button onClick={clearSearch}>
                  <X className="size-3 ml-1" />
                </button>
              </div>
            )}
            {activeTag && (
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                #{activeTag}
                <button onClick={clearTag}>
                  <X className="size-3 ml-1" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create request form */}
      {user && (
        <RequestForm onSubmit={createRequest} />
      )}

      {/* Requests feed */}
      <InfiniteScroll hasMore={hasMore} isLoading={isLoading} onLoadMore={loadMore}>
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : !isLoading ? (
          <EmptyState
            icon={MessageCircle}
            title="No requests yet"
            description={
              activeSearch || activeTag
                ? 'Try different search terms or remove filters'
                : 'Be the first to ask a question or make a request!'
            }
          />
        ) : null}
      </InfiniteScroll>
    </div>
  )
}
