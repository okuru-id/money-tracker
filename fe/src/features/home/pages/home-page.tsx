import { useQuery } from '@tanstack/react-query'
import { IconCircleMinus, IconCirclePlus } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

import { getPersonalSummary, getTransactions, type TransactionItem, type TransactionType } from '../../transactions/api'
import { EmptyState } from '../../../components/empty-state'

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function formatAmount(value: number): string {
  return idrFormatter.format(value)
}

function formatDate(value: string | null): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(date)
}

const MAX_RECENT = 5

export function HomePage() {
  const navigate = useNavigate()

  const summaryQuery = useQuery({
    queryKey: ['transactions', 'personal-summary'],
    queryFn: getPersonalSummary,
  })

  const transactionsQuery = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => getTransactions({ page: 1, limit: MAX_RECENT }),
  })

  const summary = summaryQuery.data
  const recentTransactions = transactionsQuery.data ?? []

  function handleQuickAction(type: TransactionType) {
    navigate(`/add?type=${type}`)
  }

  return (
    <div className="home-page">
      <section className="home-balance" aria-label="Summary">
        <article className="balance-card">
          <p className="balance-card__eyebrow">Personal</p>
          <h2 className="balance-card__value">{summary ? formatAmount(summary.netBalance) : '-'}</h2>
          {summaryQuery.isLoading ? (
            <p className="balance-card__hint">Memuat transaksi...</p>
          ) : summary ? (
            <dl className="balance-card__stats">
              <div>
                <dt>Expense</dt>
                <dd>{formatAmount(summary.totalExpense)}</dd>
              </div>
              <div>
                <dt>Income</dt>
                <dd>{formatAmount(summary.totalIncome)}</dd>
              </div>
            </dl>
          ) : null}
        </article>
      </section>

      <div className="home-quick-actions" role="group" aria-label="Quick add transaction">
        <button type="button" className="home-quick-actions__button" onClick={() => handleQuickAction('debit')}>
          <IconCircleMinus size={20} />
          <span>Pengeluaran</span>
        </button>
        <button type="button" className="home-quick-actions__button" onClick={() => handleQuickAction('credit')}>
          <IconCirclePlus size={20} />
          <span>Pemasukan</span>
        </button>
      </div>

      <section className="home-recent" aria-label="Transaksi terakhir">
        <div className="home-recent__header">
          <h3>Transaksi Terakhir</h3>
          {recentTransactions.length > 0 ? (
            <button type="button" className="home-recent__link" onClick={() => navigate('/history')}>
              Lihat semua
            </button>
          ) : null}
        </div>

        {transactionsQuery.isLoading ? (
          <p className="home-recent__hint">Memuat transaksi...</p>
        ) : null}

        {!transactionsQuery.isLoading && recentTransactions.length === 0 ? (
          <EmptyState message="Belum ada transaksi." />
        ) : null}

        <div className="home-recent__list">
          {recentTransactions.map((tx: TransactionItem) => (
            <article key={tx.id} className="home-recent__item">
              <div className="home-recent__item-info">
                <p className="home-recent__item-category">{tx.categoryName || 'Tanpa kategori'}</p>
                <p className="home-recent__item-date">{formatDate(tx.transactionDate ?? tx.createdAt)}</p>
              </div>
              <p
                className={
                  tx.type === 'credit'
                    ? 'home-recent__item-amount home-recent__item-amount--income'
                    : 'home-recent__item-amount home-recent__item-amount--expense'
                }
              >
                {tx.type === 'credit' ? '+' : '-'}
                {formatAmount(tx.amount)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
