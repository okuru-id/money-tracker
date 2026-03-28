import { useQuery } from '@tanstack/react-query'
import { IconTrendingDown, IconTrendingUp, IconWallet, IconReceipt } from '@tabler/icons-react'

import { getInsights } from '../../transactions/api'
import { EmptyState } from '../../../components/empty-state'

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function formatAmount(value: number): string {
  return idrFormatter.format(value)
}

function formatPercent(value: number): string {
  if (value === 0) return '0%'
  return `${Math.round(value)}%`
}

export function InsightsPage() {
  const insightsQuery = useQuery({
    queryKey: ['transactions', 'insights'],
    queryFn: getInsights,
  })

  const insights = insightsQuery.data
  const isLoading = insightsQuery.isLoading
  const hasNoData = !isLoading && insights && insights.totalTx === 0

  if (isLoading) {
    return (
      <section className="insights-page" aria-label="Insights">
        <p className="insights-page__hint">Memuat data insights...</p>
      </section>
    )
  }

  if (hasNoData) {
    return (
      <section className="insights-page" aria-label="Insights">
        <EmptyState message="Belum ada data transaksi untuk menampilkan insights." />
      </section>
    )
  }

  return (
    <section className="insights-page" aria-label="Insights">
      <div className="insights-cards">
        <article className="bank-card bank-card--expense">
          <div className="bank-card__header">
            <div className="bank-card__icon">
              <IconTrendingDown size={22} />
            </div>
            <span className="bank-card__label">Total Expense</span>
          </div>
          <h2 className="bank-card__amount">{insights ? formatAmount(insights.totalExpense) : 'Rp 0'}</h2>
          <div className="bank-card__stats">
            <span>{insights?.expenseTx ?? 0} transaksi</span>
            <span>{formatPercent(insights?.expenseRatio ?? 0)} dari income</span>
          </div>
        </article>

        <article className="bank-card bank-card--income">
          <div className="bank-card__header">
            <div className="bank-card__icon">
              <IconTrendingUp size={22} />
            </div>
            <span className="bank-card__label">Total Income</span>
          </div>
          <h2 className="bank-card__amount">{insights ? formatAmount(insights.totalIncome) : 'Rp 0'}</h2>
          <div className="bank-card__stats">
            <span>{insights?.incomeTx ?? 0} transaksi</span>
          </div>
        </article>

        <article className="bank-card bank-card--balance">
          <div className="bank-card__header">
            <div className="bank-card__icon">
              <IconWallet size={22} />
            </div>
            <span className="bank-card__label">Net Balance</span>
          </div>
          <h2 className="bank-card__amount">{insights ? formatAmount(insights.netBalance) : 'Rp 0'}</h2>
          <div className="bank-card__stats">
            <span>{insights?.totalTx ?? 0} total transaksi</span>
          </div>
        </article>

        <article className="bank-card bank-card--transactions">
          <div className="bank-card__header">
            <div className="bank-card__icon">
              <IconReceipt size={22} />
            </div>
            <span className="bank-card__label">Transaksi</span>
          </div>
          <h2 className="bank-card__amount">{insights?.totalTx ?? 0}</h2>
          <div className="bank-card__stats">
            <span>Expense: {insights?.expenseTx ?? 0}</span>
            <span>Income: {insights?.incomeTx ?? 0}</span>
          </div>
        </article>
      </div>

      <div className="insights-categories">
        <article className="category-card">
          <h3 className="category-card__title">Top Expense</h3>
          {!insights || insights.topExpense.length === 0 ? (
            <p className="category-card__empty">Belum ada pengeluaran.</p>
          ) : (
            <div className="category-card__list">
              {insights.topExpense.map(({ category, amount }, index) => (
                <div key={category} className="category-card__row">
                  <span className="category-card__rank">{index + 1}</span>
                  <span className="category-card__name">{category}</span>
                  <span className="category-card__amount">{formatAmount(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="category-card">
          <h3 className="category-card__title">Top Income</h3>
          {!insights || insights.topIncome.length === 0 ? (
            <p className="category-card__empty">Belum ada pemasukan.</p>
          ) : (
            <div className="category-card__list">
              {insights.topIncome.map(({ category, amount }, index) => (
                <div key={category} className="category-card__row">
                  <span className="category-card__rank">{index + 1}</span>
                  <span className="category-card__name">{category}</span>
                  <span className="category-card__amount">{formatAmount(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  )
}