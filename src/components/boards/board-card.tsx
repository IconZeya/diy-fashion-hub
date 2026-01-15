'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Lock } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Board } from '@/types'

interface BoardCardProps {
  board: Board
  pinCount?: number
  coverImages?: string[]
}

export function BoardCard({ board, pinCount = 0, coverImages = [] }: BoardCardProps) {
  return (
    <Link href={`/board/${board.id}`} className="group block">
      {/* Board Cover */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        {coverImages.length > 0 ? (
          <div className="grid h-full grid-cols-2 grid-rows-2 gap-0.5">
            {/* Main image */}
            <div className="relative col-span-1 row-span-2">
              <Image
                src={coverImages[0]}
                alt=""
                fill
                className="object-cover"
              />
            </div>
            {/* Secondary images */}
            <div className="relative">
              {coverImages[1] ? (
                <Image
                  src={coverImages[1]}
                  alt=""
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full bg-muted" />
              )}
            </div>
            <div className="relative">
              {coverImages[2] ? (
                <Image
                  src={coverImages[2]}
                  alt=""
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full bg-muted" />
              )}
            </div>
          </div>
        ) : board.cover_url ? (
          <Image
            src={board.cover_url}
            alt={board.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <span className="text-4xl text-muted-foreground/50">
              {board.title[0]?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />

        {/* Private indicator */}
        {board.is_private && (
          <div className="absolute bottom-2 right-2 flex size-6 items-center justify-center rounded-full bg-black/50">
            <Lock className="size-3 text-white" />
          </div>
        )}
      </div>

      {/* Board Info */}
      <div className="mt-2">
        <h3 className="font-medium group-hover:underline line-clamp-1">
          {board.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {pinCount} {pinCount === 1 ? 'pin' : 'pins'}
        </p>
      </div>
    </Link>
  )
}
