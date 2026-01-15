'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface UseInfiniteScrollOptions {
  threshold?: number
  rootMargin?: string
}

export function useInfiniteScroll(
  onLoadMore: () => void,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 0.1, rootMargin = '100px' } = options
  const [isIntersecting, setIsIntersecting] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const targetRef = useRef<HTMLDivElement | null>(null)

  const setTarget = useCallback((node: HTMLDivElement | null) => {
    targetRef.current = node
  }, [])

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting) {
          onLoadMore()
        }
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    )

    observerRef.current.observe(target)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [onLoadMore, rootMargin, threshold])

  return { setTarget, isIntersecting }
}
