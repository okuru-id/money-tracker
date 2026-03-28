import { IconRefresh } from '@tabler/icons-react'
import { usePullToRefresh } from '../lib/use-pull-to-refresh'

type PullToRefreshProps = {
  children: React.ReactNode
  onRefresh?: () => Promise<void>
  disabled?: boolean
}

export function PullToRefresh({ children, onRefresh, disabled }: PullToRefreshProps) {
  const { bind, isPulling, pullDistance, isRefreshing, pullProgress } = usePullToRefresh({
    onRefresh,
    disabled,
  })

  const showIndicator = isPulling || isRefreshing
  const rotation = pullProgress * 360

  return (
    <div {...bind} className="pull-to-refresh">
      {showIndicator && (
        <div
          className="pull-to-refresh__indicator"
          style={{
            top: pullDistance - 40,
            opacity: Math.min(pullProgress * 1.5, 1),
          }}
        >
          <div
            className="pull-to-refresh__icon"
            style={{
              transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            }}
          >
            <IconRefresh size={24} stroke={2} />
          </div>
        </div>
      )}
      {children}
    </div>
  )
}