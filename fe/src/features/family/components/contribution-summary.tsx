import type { FamilyContribution } from '../api'

type ContributionSummaryProps = {
  contributions: FamilyContribution[]
  isLoading: boolean
}

function formatAmount(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function ContributionSummary({ contributions, isLoading }: ContributionSummaryProps) {
  if (isLoading) {
    return <p className="family-card__hint">Loading member contributions...</p>
  }

  if (contributions.length === 0) {
    return <p className="family-card__hint">No contribution data for this period.</p>
  }

  return (
    <ul className="contribution-summary">
      {contributions.map((item) => (
        <li key={item.memberId} className="contribution-summary__item">
          <p className="contribution-summary__name">{item.memberName}</p>
          <dl className="contribution-summary__stats">
            <div>
              <dt>Income</dt>
              <dd>{formatAmount(item.totalIncome)}</dd>
            </div>
            <div>
              <dt>Expense</dt>
              <dd>{formatAmount(item.totalExpense)}</dd>
            </div>
            <div>
              <dt>Net</dt>
              <dd>{formatAmount(item.netBalance)}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  )
}
