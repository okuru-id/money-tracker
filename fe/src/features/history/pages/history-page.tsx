import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { ApiError } from '../../auth/api'
import { useSessionState } from '../../auth/session-store'
import { getFamilyMembers } from '../../family/api'
import {
  getCategories,
  getTransactions,
  getBankAccounts,
  updateTransaction,
  deleteTransaction,
} from '../../transactions/api'
import { MonthNavigator } from '../components/period-filter'
import { TransactionItem } from '../components/transaction-item'
import { EmptyState } from '../../../components/empty-state'

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  return 'Failed to load transaction history.'
}

function toMonthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

function getMonthRange(year: number, month: number) {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { startDate, endDate }
}

export function HistoryPage() {
  const queryClient = useQueryClient()
  const session = useSessionState()
  const currentUserId = session.user?.id ?? null
  const familyId = session.familyId
  const isAdmin = session.isAdmin

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const systemUserIds = [
    '00000000-0000-0000-0000-000000000001',
    '3d271d3a-1f59-4071-abd0-66b37ceca2ae',
  ]

  const { startDate, endDate } = getMonthRange(year, month)
  const monthKey = toMonthKey(year, month)

  const transactionsQuery = useQuery({
    queryKey: ['transactions', 'history', monthKey, currentUserId],
    queryFn: () => getTransactions({ startDate, endDate, page: 1, limit: 50 }),
    enabled: Boolean(currentUserId),
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getCategories,
  })

  const bankAccountsQuery = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: getBankAccounts,
  })

  const familyMembersQuery = useQuery({
    queryKey: ['family-members', familyId],
    queryFn: () => getFamilyMembers(familyId!),
    enabled: Boolean(familyId),
  })

  // Check if current user is family owner
  const isFamilyOwner = familyMembersQuery.data?.members.some(
    (member) => member.userId === currentUserId && member.role === 'owner'
  ) ?? false

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      amount,
      categoryId,
      notes,
      accountNumber,
    }: {
      id: string
      amount: number
      categoryId: string | null
      notes?: string
      accountNumber?: string | null
    }) =>
      updateTransaction(id, {
        amount,
        categoryId,
        notes,
        accountNumber,
      }),
    onSuccess: () => {
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['transactions'] })
      void queryClient.invalidateQueries({ queryKey: ['family-summary'] })
      void queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
    },
    onError: (error) => {
      setErrorMessage(toErrorMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['transactions'] })
      void queryClient.invalidateQueries({ queryKey: ['family-summary'] })
      void queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
    },
    onError: (error) => {
      setErrorMessage(toErrorMessage(error))
    },
  })

  const transactions = transactionsQuery.data ?? []
  const activeMonthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1))

  function handleMonthChange(nextYear: number, nextMonth: number) {
    setYear(nextYear)
    setMonth(nextMonth)
  }

  return (
    <section className="history-page">
      <header className="history-page__hero">
        <div className="history-page__hero-copy">
          <p className="page-card__eyebrow">Monthly ledger</p>
          <h1>Review and update transactions with more context.</h1>
          <p>
            Move across months, scan recent activity, and edit records without
            leaving the page.
          </p>
        </div>
        <div className="history-page__hero-card" aria-hidden="true">
          <p>{activeMonthLabel}</p>
          <strong>{transactions.length} entries</strong>
        </div>
      </header>

      <div className="history-page__toolbar">
        <MonthNavigator year={year} month={month} disabled={transactionsQuery.isLoading} onChange={handleMonthChange} />
      </div>

      <div className="history-page__workspace">
        {errorMessage ? <p className="history-page__error">{errorMessage}</p> : null}

        {transactionsQuery.isLoading ? <p className="history-page__hint">Loading transaction history...</p> : null}

        {!transactionsQuery.isLoading && transactions.length === 0 ? (
          <EmptyState message="No transactions this month." />
        ) : null}

        <div className="history-page__list">
        {transactions.map((transaction) => {
          // Check if this is a legacy transaction (created by system user)
          const isLegacy = transaction.createdByUserId && systemUserIds.includes(transaction.createdByUserId)

          // Allow edit for:
          // - Admin users can edit any transaction (including legacy)
          // - Family owner can edit any transaction (including legacy)
          // - Creator can edit their own non-legacy transaction
          const canEdit = Boolean(currentUserId) && (
            isAdmin ||
            isFamilyOwner ||
            (!isLegacy && (!transaction.createdByUserId || transaction.createdByUserId === currentUserId))
          )

          // Allow delete only for own transactions (non-legacy)
          const canDelete = !isLegacy && Boolean(currentUserId) && transaction.createdByUserId === currentUserId

          return (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              categories={categoriesQuery.data ?? []}
              bankAccounts={bankAccountsQuery.data ?? []}
              canEdit={canEdit}
              canDelete={canDelete}
              isSaving={updateMutation.isPending && updateMutation.variables?.id === transaction.id}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === transaction.id}
              onSave={async (payload) => {
                await updateMutation.mutateAsync(payload)
              }}
              onDelete={async () => {
                await deleteMutation.mutateAsync(transaction.id)
              }}
            />
          )
        })}
      </div>
      </div>
    </section>
  )
}
