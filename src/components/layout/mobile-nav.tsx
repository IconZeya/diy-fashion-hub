'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Home, MessageSquarePlus, Plus, Search, User } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/requests', icon: MessageSquarePlus, label: 'Requests' },
  { href: '/create', icon: Plus, label: 'Create', highlight: true },
  { href: '/explore', icon: Compass, label: 'Explore' },
]

export function MobileNav() {
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const { profile, user } = useAuthStore()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const profileHref = user ? `/profile/${profile?.username}` : '/login'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = isMounted && pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-colors',
                isActive && 'text-primary',
                item.highlight && 'text-primary'
              )}
            >
              {item.highlight ? (
                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <item.icon className="size-5" />
                </div>
              ) : (
                <item.icon className="size-6" />
              )}
              {!item.highlight && (
                <span className="text-xs">{item.label}</span>
              )}
            </Link>
          )
        })}

        {/* Profile */}
        <Link
          href={profileHref}
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-colors',
            isMounted && pathname.startsWith('/profile') && 'text-primary'
          )}
        >
          <User className="size-6" />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  )
}
