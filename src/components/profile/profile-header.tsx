'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Settings, Heart, Sparkles, Crown, Scissors } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BadgeDisplay } from './badge-display'
import type { ProfileWithStats } from '@/types'

interface ProfileHeaderProps {
  profile: ProfileWithStats
  isOwnProfile: boolean
  isFollowing: boolean
  onFollowToggle?: () => void
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  isFollowing,
  onFollowToggle,
}: ProfileHeaderProps) {
  return (
    <div className="relative">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -top-20 -right-20 size-64 rounded-full bg-pink-200/30 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 size-48 rounded-full bg-pink-300/20 blur-2xl" />
        <div className="absolute top-1/2 left-1/3 size-32 rounded-full bg-pink-100/40 blur-xl" />
      </div>

      {/* Main card */}
      <div className="relative rounded-3xl border-2 border-pink-200 bg-gradient-to-br from-white via-pink-50/50 to-white p-1 shadow-xl shadow-pink-100/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 dark:border-pink-900/50">
        {/* Cover Image */}
        <div className="relative h-56 overflow-hidden rounded-t-2xl bg-gradient-to-r from-zinc-900 via-pink-900/20 to-zinc-900">
          {profile.cover_url ? (
            <Image
              src={profile.cover_url}
              alt=""
              fill
              className="object-cover"
              priority
            />
          ) : (
            <>
              {/* Default cute pattern when no cover */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(244,114,182,0.3)_0%,transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,207,232,0.3)_0%,transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,114,182,0.15)_0%,transparent_70%)]" />

              {/* Floating decorative elements */}
              <div className="absolute top-6 left-8 text-pink-300/60">
                <Sparkles className="size-6" />
              </div>
              <div className="absolute top-12 right-16 text-pink-400/50">
                <Heart className="size-5 fill-current" />
              </div>
              <div className="absolute bottom-8 left-1/4 text-pink-300/40">
                <Scissors className="size-5" />
              </div>
              <div className="absolute top-8 right-1/3 text-pink-200/50">
                <Crown className="size-6" />
              </div>
              <div className="absolute bottom-12 right-12 text-pink-400/60">
                <Sparkles className="size-4" />
              </div>
            </>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Profile Info Card */}
        <div className="relative -mt-20 px-6 pb-6">
          {/* Avatar with ring */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Decorative ring */}
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400 opacity-75 blur-sm" />
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-400 via-pink-200 to-pink-400" />

              <Avatar className="relative size-36 border-4 border-white shadow-2xl dark:border-zinc-900">
                <AvatarImage
                  src={profile.avatar_url || undefined}
                  alt={profile.display_name || profile.username}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-pink-600 text-4xl font-bold text-white">
                  {profile.display_name?.[0]?.toUpperCase() ||
                    profile.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Online indicator / badge */}
              <div className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-3 border-white bg-gradient-to-r from-pink-400 to-pink-500 shadow-lg dark:border-zinc-900">
                <Sparkles className="size-4 text-white" />
              </div>
            </div>

            {/* Name & Username */}
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {profile.display_name || profile.username}
            </h1>
            <p className="mt-1 text-pink-500 font-medium">@{profile.username}</p>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-4 max-w-md text-center text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Badges */}
            <div className="mt-5">
              <BadgeDisplay username={profile.username} showTitle={false} maxDisplay={6} />
            </div>

            {/* Stats */}
            <div className="mt-6 flex gap-2">
              <div className="group flex flex-col items-center rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 px-6 py-4 shadow-lg transition-transform hover:scale-105 dark:from-zinc-800 dark:to-zinc-700">
                <p className="text-2xl font-bold text-pink-400">{profile.stats?.pin_count || 0}</p>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Pins</p>
              </div>
              <div className="group flex flex-col items-center rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 px-6 py-4 shadow-lg transition-transform hover:scale-105 dark:from-zinc-800 dark:to-zinc-700">
                <p className="text-2xl font-bold text-pink-400">
                  {profile.stats?.follower_count || 0}
                </p>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Followers</p>
              </div>
              <div className="group flex flex-col items-center rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 px-6 py-4 shadow-lg transition-transform hover:scale-105 dark:from-zinc-800 dark:to-zinc-700">
                <p className="text-2xl font-bold text-pink-400">
                  {profile.stats?.following_count || 0}
                </p>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Following</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-3">
              {isOwnProfile ? (
                <Button
                  asChild
                  className="rounded-full bg-gradient-to-r from-zinc-900 to-zinc-800 px-8 py-6 text-white shadow-lg transition-all hover:shadow-pink-200/50 hover:scale-105 dark:from-zinc-700 dark:to-zinc-600"
                >
                  <Link href="/profile/edit">
                    <Settings className="mr-2 size-4" />
                    Edit Profile
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={onFollowToggle}
                  className={`rounded-full px-8 py-6 text-base font-semibold shadow-lg transition-all hover:scale-105 ${
                    isFollowing
                      ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700'
                      : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 hover:shadow-pink-300/50'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Heart className="mr-2 size-4 fill-pink-500 text-pink-500" />
                      Following
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 size-4" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
