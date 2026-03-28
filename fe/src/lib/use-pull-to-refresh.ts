import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const PULL_THRESHOLD = 80
const MAX_PULL = 120

type UsePullToRefreshOptions = {
  onRefresh?: () => Promise<void>
  disabled?: boolean
}

type PullState = {
  isPulling: boolean
  pullDistance: number
  isRefreshing: boolean
}

export function usePullToRefresh(options: UsePullToRefreshOptions = {}) {
  const { onRefresh, disabled = false } = options
  const queryClient = useQueryClient()

  const [state, setState] = useState<PullState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
  })

  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled) return

      const container = containerRef.current
      if (!container) return

      if (container.scrollTop > 0) return

      startY.current = e.touches[0].clientY
    },
    [disabled],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || startY.current === 0) return

      const container = containerRef.current
      if (!container) return

      if (container.scrollTop > 0) {
        startY.current = 0
        return
      }

      const currentY = e.touches[0].clientY
      const diff = currentY - startY.current

      if (diff > 0) {
        if (diff > 10) {
          e.preventDefault()
        }

        const pullDistance = Math.min(diff * 0.5, MAX_PULL)
        setState((prev) => ({ ...prev, isPulling: true, pullDistance }))
      }
    },
    [disabled],
  )

  const handleTouchEnd = useCallback(async () => {
    setState((prev) => {
      if (!prev.isPulling || prev.isRefreshing) {
        startY.current = 0
        return { ...prev, isPulling: false, pullDistance: 0 }
      }

      startY.current = 0

      if (prev.pullDistance >= PULL_THRESHOLD) {
        return { ...prev, isRefreshing: true, pullDistance: PULL_THRESHOLD }
      }

      return { ...prev, isPulling: false, pullDistance: 0 }
    })

    // Read state after update using a ref-like approach via setTimeout
    setTimeout(async () => {
      setState((prev) => {
        if (!prev.isRefreshing) return prev

        const doRefresh = async () => {
          try {
            if (onRefresh) {
              await onRefresh()
            } else {
              await queryClient.invalidateQueries()
            }
          } finally {
            setState((s) => ({ ...s, isRefreshing: false, pullDistance: 0, isPulling: false }))
          }
        }

        doRefresh()
        return prev
      })
    }, 0)
  }, [onRefresh, queryClient])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
    container.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const bind = {
    ref: containerRef,
  }

  return {
    bind,
    isPulling: state.isPulling,
    pullDistance: state.pullDistance,
    isRefreshing: state.isRefreshing,
    pullProgress: Math.min(state.pullDistance / PULL_THRESHOLD, 1),
  }
}