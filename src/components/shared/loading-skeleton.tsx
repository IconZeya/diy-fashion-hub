import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface PinSkeletonProps {
  className?: string
}

export function PinSkeleton({ className }: PinSkeletonProps) {
  // Random height for masonry effect
  const heights = ['h-48', 'h-56', 'h-64', 'h-72', 'h-80']
  const randomHeight = heights[Math.floor(Math.random() * heights.length)]

  return (
    <div className={cn('space-y-2', className)}>
      <Skeleton className={cn('w-full rounded-xl', randomHeight)} />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-2">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function PinGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <PinSkeleton key={i} />
      ))}
    </div>
  )
}

export function BoardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <Skeleton className="aspect-[4/3] w-full rounded-xl" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}

export function BoardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <BoardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="relative">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -top-20 -right-20 size-64 rounded-full bg-pink-200/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 -left-10 size-48 rounded-full bg-pink-300/20 blur-2xl animate-pulse" />
      </div>

      {/* Main card */}
      <div className="relative rounded-3xl border-2 border-pink-200 bg-gradient-to-br from-white via-pink-50/50 to-white p-1 shadow-xl dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 dark:border-pink-900/50">
        {/* Cover */}
        <Skeleton className="h-56 w-full rounded-t-2xl" />

        {/* Avatar and info */}
        <div className="flex flex-col items-center -mt-20 relative z-10 px-6 pb-6">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400 opacity-50 blur-sm animate-pulse" />
            <Skeleton className="relative size-36 rounded-full border-4 border-white dark:border-zinc-900" />
          </div>
          <Skeleton className="h-8 w-48 mt-5" />
          <Skeleton className="h-5 w-32 mt-2" />
          <Skeleton className="h-4 w-72 mt-4" />

          {/* Stats */}
          <div className="flex gap-2 mt-6">
            <Skeleton className="h-20 w-24 rounded-2xl" />
            <Skeleton className="h-20 w-24 rounded-2xl" />
            <Skeleton className="h-20 w-24 rounded-2xl" />
          </div>

          {/* Button */}
          <Skeleton className="h-12 w-40 rounded-full mt-8" />
        </div>
      </div>
    </div>
  )
}

export function PinDetailSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Skeleton className="aspect-[3/4] w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex items-center gap-3 mt-6">
          <Skeleton className="size-12 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24 mt-1" />
          </div>
        </div>
      </div>
    </div>
  )
}
