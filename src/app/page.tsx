'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  Compass,
  Heart,
  Layout,
  Scissors,
  Sparkles,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PinGrid } from '@/components/pins'
import { CategoryPills } from '@/components/shared/category-pills'
import { InfiniteScroll } from '@/components/shared/infinite-scroll'
import { FeedTabs, type FeedFilter } from '@/components/shared/feed-tabs'
import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { SaveToBoardModal } from '@/components/boards/save-to-board-modal'
import { CreateBoardModal } from '@/components/boards/create-board-modal'
import { useAuthStore } from '@/stores/auth-store'
import type { PinWithUser } from '@/types'
import { FEED_PAGE_SIZE } from '@/lib/constants'

export default function HomePage() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || undefined
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(category)
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('discover')
  const [pins, setPins] = useState<PinWithUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [feedMessage, setFeedMessage] = useState<string | null>(null)

  const { user, setUser, setProfile, setLoading, setInitialized, isInitialized } = useAuthStore()

  // Fetch pins from feed API
  const fetchPins = useCallback(async (reset = false) => {
    if (isLoading) return

    setIsLoading(true)
    const currentPage = reset ? 1 : page

    try {
      const params = new URLSearchParams()
      params.append('page', String(currentPage))
      params.append('limit', String(FEED_PAGE_SIZE))
      params.append('filter', feedFilter)
      if (selectedCategory) {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/feed?${params.toString()}`)
      const data = await response.json()

      if (data.error) {
        console.error('Feed error:', data.error)
        return
      }

      setFeedMessage(data.message || null)

      if (reset) {
        setPins(data.data || [])
        setPage(2)
      } else {
        setPins((prev) => [...prev, ...(data.data || [])])
        setPage(currentPage + 1)
      }

      setHasMore((data.data?.length || 0) === FEED_PAGE_SIZE)
    } catch (error) {
      console.error('Error fetching feed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, page, feedFilter, selectedCategory])

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchPins()
    }
  }, [hasMore, isLoading, fetchPins])

  // Initialize auth from session API
  useEffect(() => {
    async function initializeAuth() {
      setLoading(true)
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()

        if (data.user && data.profile) {
          setUser(data.user)
          setProfile(data.profile)
        }
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    initializeAuth()
  }, [setUser, setProfile, setLoading, setInitialized])

  // Fetch pins when filter, category, or auth changes
  useEffect(() => {
    if (isInitialized) {
      fetchPins(true)
    }
  }, [feedFilter, selectedCategory, isInitialized])

  useEffect(() => {
    setSelectedCategory(category)
  }, [category])

  // Handle tab change
  const handleTabChange = (tab: FeedFilter) => {
    setFeedFilter(tab)
    setPins([])
    setPage(1)
    setHasMore(true)
    setFeedMessage(null)
  }

  // Show landing page for non-authenticated users
  if (isInitialized && !user) {
    return <LandingPage />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 py-6 pb-24 md:pb-6">
        <div className="space-y-6">
          {/* Feed Tabs */}
          <div className="flex justify-center">
            <FeedTabs
              activeTab={feedFilter}
              onTabChange={handleTabChange}
              isAuthenticated={!!user}
            />
          </div>

          {/* Category Filter */}
          <div className="sticky top-16 z-40 -mx-4 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CategoryPills
              selectedCategory={selectedCategory || null}
              onCategoryChange={(cat) => setSelectedCategory(cat || undefined)}
            />
          </div>

          {/* Feed Message (for empty following feed) */}
          {feedMessage && pins.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{feedMessage}</p>
              {feedFilter === 'following' && (
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/explore">Discover Creators</Link>
                </Button>
              )}
            </div>
          )}

          {/* Pin Feed */}
          <InfiniteScroll
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={loadMore}
          >
            <PinGrid
              pins={pins}
              isLoading={isLoading && pins.length === 0}
              emptyMessage={
                feedFilter === 'following'
                  ? "No pins from people you follow"
                  : feedFilter === 'trending'
                  ? "No trending pins this week"
                  : "No DIY projects yet"
              }
              emptyDescription={
                feedFilter === 'following'
                  ? "Follow some creators to see their pins here"
                  : feedFilter === 'trending'
                  ? "Be the first to create something popular!"
                  : "Be the first to share your creative ideas!"
              }
            />
          </InfiniteScroll>
        </div>
      </main>
      <MobileNav />
      <SaveToBoardModal />
      <CreateBoardModal />
    </div>
  )
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Scissors className="size-5" />
            </div>
            <span className="text-xl font-bold">DIY Fashion Hub</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Discover & Share
            <span className="text-primary"> DIY Fashion</span> Ideas
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Join a community of creative fashion enthusiasts. Find inspiration,
            share your projects, and learn new techniques for upcycling,
            embroidery, tie-dye, and more.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg">
              <Link href="/explore">
                <Compass className="mr-2 size-5" />
                Explore Projects
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-16 md:py-24">
        <div className="container px-4">
          <h2 className="text-center text-3xl font-bold">
            Everything You Need to Create
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Sparkles}
              title="Get Inspired"
              description="Browse thousands of DIY fashion projects from creators around the world"
            />
            <FeatureCard
              icon={Layout}
              title="Organize Ideas"
              description="Save your favorite pins to boards and keep your inspiration organized"
            />
            <FeatureCard
              icon={Heart}
              title="Share Your Work"
              description="Upload your creations and get feedback from the community"
            />
            <FeatureCard
              icon={Users}
              title="Connect"
              description="Follow creators you love and build your DIY fashion network"
            />
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <h2 className="text-center text-3xl font-bold">Popular Categories</h2>
          <p className="mt-4 text-center text-muted-foreground">
            Find projects that match your interests
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {[
              { name: 'Upcycling', color: 'bg-green-100 text-green-800' },
              { name: 'Embroidery', color: 'bg-pink-100 text-pink-800' },
              { name: 'Tie-Dye', color: 'bg-purple-100 text-purple-800' },
              { name: 'Sewing', color: 'bg-blue-100 text-blue-800' },
              { name: 'Accessories', color: 'bg-amber-100 text-amber-800' },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={`/?category=${cat.name.toLowerCase()}`}
                className={`rounded-xl p-6 text-center font-medium transition-transform hover:scale-105 ${cat.color}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to Start Creating?</h2>
          <p className="mt-4 text-primary-foreground/80">
            Join thousands of DIY fashion enthusiasts today
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-8 text-lg"
          >
            <Link href="/register">Create Your Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 DIY Fashion Hub. Made with creativity.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border bg-background p-6 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="size-6 text-primary" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
