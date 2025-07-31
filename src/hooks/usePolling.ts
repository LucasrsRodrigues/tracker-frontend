import { useEffect, useRef } from 'react'

interface UsePollingOptions {
  enabled?: boolean
  interval: number
  immediate?: boolean
}

export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions
) {
  const { enabled = true, interval, immediate = false } = options
  const savedCallback = useRef<() => void | Promise<void>>()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current()
      }
    }

    if (enabled && interval > 0) {
      if (immediate) {
        tick()
      }
      intervalRef.current = setInterval(tick, interval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, interval, immediate])

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const start = () => {
    if (!intervalRef.current && enabled) {
      intervalRef.current = setInterval(() => {
        if (savedCallback.current) {
          savedCallback.current()
        }
      }, interval)
    }
  }

  return { stop, start }
}