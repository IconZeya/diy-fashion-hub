'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LogOut,
  Menu,
  MessageSquarePlus,
  Plus,
  Scissors,
  Settings,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SearchBar } from './search-bar'
import { NotificationBell } from '@/components/notifications'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'

export function Navbar() {
  const router = useRouter()
  const { user, profile, logout } = useAuthStore()
  
  const { toggleMobileMenu } = useUIStore()

  async function handleLogout() {
    try {
      // Use server-side logout to properly clear cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
      })

      logout()
      router.push('/login')
      router.refresh()
      toast.success('Signed out successfully')
    } catch {
      // Even if the API call fails, clear local state
      logout()
      router.push('/login')
      router.refresh()
      toast.success('Signed out successfully')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Scissors className="size-5" />
          </div>
          <span className="hidden text-xl font-bold sm:inline-block">
            DIY Fashion Hub
          </span>
        </Link>

        {/* DIY Requests Link */}
        <Link
          href="/requests"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium transition-colors"
        >
          <MessageSquarePlus className="size-4" />
          <span className="hidden sm:inline">DIY Requests</span>
        </Link>

        {/* Search - Desktop */}
        <div className="hidden flex-1 max-w-xl md:block">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              {/* Create Button */}
              <Button asChild size="sm" className="hidden sm:flex">
                <Link href="/create">
                  <Plus className="size-4" />
                  Create
                </Link>
              </Button>

              {/* Mobile Create */}
              <Button asChild size="icon" variant="ghost" className="sm:hidden">
                <Link href="/create">
                  <Plus className="size-5" />
                </Link>
              </Button>

              {/* Notifications */}
              <NotificationBell />

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="size-8">
                      <AvatarImage
                        src={profile?.avatar_url || undefined}
                        alt={profile?.display_name || 'User'}
                      />
                      <AvatarFallback>
                        {profile?.display_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="size-10">
                      <AvatarImage
                        src={profile?.avatar_url || undefined}
                        alt={profile?.display_name || 'User'}
                      />
                      <AvatarFallback>
                        {profile?.display_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {profile?.display_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        @{profile?.username}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild disabled={!profile?.username}>
                    <Link href={profile?.username ? `/profile/${profile.username}` : '#'}>
                      <User className="size-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="size-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="size-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </nav>

      {/* Search - Mobile */}
      <div className="border-t p-2 md:hidden">
        <SearchBar />
      </div>
    </header>
  )
}
