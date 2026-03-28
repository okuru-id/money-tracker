import { useCallback, useRef, useState } from 'react'
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
    (e: React.TouchEvent) => {
      if (disabled || state.isRefreshing) return

      const container = containerRef.current
      if (!container) return

      // Only trigger if scrolled to top
      if (container.scrollTop > 0) return

      startY.current = e.touches[0].clientY
    },
    [disabled, state.isRefreshing],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || state.isRefreshing || startY.current === 0) return

      const container = containerRef.current
      if (!container) return

      // Check if still at top
      if (container.scrollTop > 0) {
        startY.current = 0
        return
      }

      const currentY = e.touches[0].clientY
      const diff = currentY - startY.current

      if (diff > 0) {
        // Prevent default scroll while pulling
        if (diff > 10) {
          e.preventDefault()
        }

        const pullDistance = Math.min(diff * 0.5, MAX_PULL)
        setState((prev) => ({ ...prev, isPulling: true, pullDistance }))
      }
    },
    [disabled, state.isRefreshing],
  )

  const handleTouchEnd = useCallback(async () => {
    if (!state.isPulling || state.isRefreshing) {
      startY.current = 0
      setState((prev) => ({ ...prev, isPulling: false, pullDistance: 0 }))
      return
    }

    startY.current = 0

    if (state.pullDistance >= PULL_THRESHOLD) {
      setState((prev) => ({ ...prev, isRefreshing: true, pullDistance: PULL_THRESHOLD }))

      try {
        if (onRefresh) {
          await onRefresh()
        } else {
          // Default: refetch all queries
          await queryClient.invalidateQueries()
        }
      } finally {
        setState((prev) => ({ ...prev, isRefreshing: false, pullDistance: 0, isPulling: false }))
      }
    } else {
      setState((prev) => ({ ...prev, isPulling: false, pullDistance: 0 }))
    }
  }, [state.isPulling, state.isRefreshing, state.pullDistance, onRefresh, queryClient])

  const bind = {
    ref: containerRef,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
  }

  return {
    bind,
    isPulling: state.isPulling,
    pullDistance: state.pullDistance,
    isRefreshing: state.isRefreshing,
    pullProgress: Math.min(state.pullDistance / PULL_THRESHOLD, 1),
  }
}