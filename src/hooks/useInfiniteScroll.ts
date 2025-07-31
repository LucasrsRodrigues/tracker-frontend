import { useEffect, useRef } from 'react'

interface UseInfiniteScrollOptions {
  hasNextPage: boolean
  fetchNextPage: () => void
  isFetching: boolean
  threshold?: number
}

export function useInfiniteScroll({
  hasNextPage,
  fetchNextPage,
  isFetching,
  threshold = 100,
}: UseInfiniteScrollOptions) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetching) {
          fetchNextPage()
        }
      },
      {
        threshold: 0.1,
        rootMargin: `${threshold}px`,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [hasNextPage, fetchNextPage, isFetching, threshold])

  return { ref }
}