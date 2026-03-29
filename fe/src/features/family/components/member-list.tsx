import type { FamilyMember } from '../api'

type MemberListProps = {
  members: FamilyMember[]
  currentUserId?: string
  isOwner?: boolean
  onDeleteMember?: (userId: string) => void
  isDeleting?: boolean
}

function normalizeRole(role: string): string {
  if (role.toLowerCase() === 'owner') {
    return 'Owner'
  }

  return 'Member'
}

export function MemberList({
  members,
  currentUserId,
  isOwner = false,
  onDeleteMember,
  isDeleting = false,
}: MemberListProps) {
  if (members.length === 0) {
    return <p className="family-card__hint">No active members in this family yet.</p>
  }

  return (
    <ul className="family-member-list">
      {members.map((member) => {
        const isCurrentUser = member.userId === currentUserId
        const canDelete = isOwner && !isCurrentUser && normalizeRole(member.role) !== 'Owner'

        return (
          <li key={member.id} className="family-member-list__item">
            <div>
              <p className="family-member-list__name">{member.name}</p>
              <p className="family-member-list__email">{member.email}</p>
            </div>
            <div className="family-member-list__meta">
              <span className="family-member-list__role">{normalizeRole(member.role)}</span>
              <span className="family-member-list__status">{member.status}</span>
              {canDelete && onDeleteMember ? (
                <button
                  type="button"
                  className="family-member-list__delete-btn"
                  disabled={isDeleting}
                  onClick={() => onDeleteMember(member.userId ?? '')}
                  title="Remove member"
                >
                  ×
                </button>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
