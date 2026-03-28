import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { useSessionState } from '../../auth/session-store'
import { BalanceCards } from '../components/balance-cards'
import { getFamilyMonthlySummary, getTransactions, type TransactionType } from '../../transactions/api'

function aggregateTotals(rows: Array<{ amount: number; type: string }>) {
  let totalIncome = 0
  let totalExpense = 0

  for (const row of rows) {
    if (row.type === 'income') {
      totalIncome += row.amount
    }

    if (row.type === 'expense') {
      totalExpense += row.amount
    }
  }

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
  }
}

export function HomePage() {
  const navigate = useNavigate()
  const session = useSessionState()
  const familyId = session.familyId

  const personalTransactionsQuery = useQuery({
    queryKey: ['transactions', 'month', 'personal'],
    queryFn: () => getTransactions({ period: 'month' }),
  })

  const familySummaryQuery = useQuery({
    queryKey: ['family-summary', familyId, 'month'],
    queryFn: () => getFamilyMonthlySummary(familyId ?? ''),
    enabled: Boolean(familyId),
  })

  const personalTotals = aggregateTotals(personalTransactionsQuery.data ?? [])
  const familyTotals = familySummaryQuery.data ?? null

  function handleQuickAction(type: TransactionType) {
    navigate(`/add?type=${type}`)
  }

  return (
    <div className="home-page">
      <BalanceCards
        personal={personalTotals}
        family={familyTotals}
        isPersonalLoading={personalTransactionsQuery.isLoading}
        isFamilyLoading={familySummaryQuery.isLoading}
        canLoadFamily={Boolean(familyId)}
        onQuickAction={handleQuickAction}
      />
    </div>
  )
}
