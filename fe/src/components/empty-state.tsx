import { IconInbox } from '@tabler/icons-react'

type EmptyStateProps = {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <IconInbox size={36} className="empty-state__icon" />
      <p className="empty-state__message">{message}</p>
    </div>
  )
}
