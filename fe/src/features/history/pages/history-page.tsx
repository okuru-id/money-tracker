import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { ApiError } from '../../auth/api'
import { useSessionState } from '../../auth/session-store'
import {
  getCategories,
  getTransactions,
  updateTransaction,
  type TransactionPeriod,
} from '../../transactions/api'
import { PeriodFilter } from '../components/period-filter'
import { TransactionItem } from '../components/transaction-item'

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  return 'Gagal memuat riwayat transaksi.'
}

export function HistoryPage() {
  const queryClient = useQueryClient()
  const session = useSessionState()
  const currentUserId = session.user?.id ?? null

  const [period, setPeriod] = useState<TransactionPeriod>('today')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const systemUserIds = [
    '00000000-0000-0000-0000-000000000001',
    '3d271d3a-1f59-4071-abd0-66b37ceca2ae',
  ]

  const transactionsQuery = useQuery({
    queryKey: ['transactions', 'history', period, currentUserId],
    queryFn: () => getTransactions({ period, page: 1, limit: 50 }),
    enabled: Boolean(currentUserId),
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getCategories,
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      amount,
      categoryId,
      notes,
    }: {
      id: string
      amount: number
      categoryId: string | null
      notes?: string
    }) =>
      updateTransaction(id, {
        amount,
        categoryId,
        notes,
      }),
    onSuccess: () => {
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['transactions'] })
      void queryClient.invalidateQueries({ queryKey: ['family-summary'] })
    },
    onError: (error) => {
      setErrorMessage(toErrorMessage(error))
    },
  })

  const transactions = transactionsQuery.data ?? []

  return (
    <section className="history-page" aria-labelledby="history-page-title">
      <PeriodFilter value={period} onChange={setPeriod} disabled={transactionsQuery.isLoading} />

      {errorMessage ? <p className="history-page__error">{errorMessage}</p> : null}

      {transactionsQuery.isLoading ? <p className="history-page__hint">Memuat riwayat transaksi...</p> : null}

      {!transactionsQuery.isLoading && transactions.length === 0 ? (
        <p className="history-page__hint">Belum ada transaksi pada periode ini.</p>
      ) : null}

        <div className="history-page__list">
        {transactions.map((transaction) => {
          // Check if this is a legacy transaction
          const isLegacy = transaction.createdByUserId && systemUserIds.includes(transaction.createdByUserId)

          // Allow edit for non-legacy transactions owned by the current user.
          // If ownership is missing from older payloads, keep edit available as a compatibility fallback.
          const canEdit = !isLegacy && Boolean(currentUserId) && (!transaction.createdByUserId || transaction.createdByUserId === currentUserId)

          return (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              categories={categoriesQuery.data ?? []}
              canEdit={canEdit}
              isSaving={updateMutation.isPending && updateMutation.variables?.id === transaction.id}
              onSave={async (payload) => {
                await updateMutation.mutateAsync(payload)
              }}
            />
          )
        })}
      </div>
    </section>
  )
}
