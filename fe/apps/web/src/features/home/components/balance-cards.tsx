import type { TransactionType } from '../../transactions/api'

type SummaryTotals = {
  totalIncome: number
  totalExpense: number
  netBalance: number
}

type BalanceCardsProps = {
  personal: SummaryTotals
  family: SummaryTotals | null
  isPersonalLoading: boolean
  isFamilyLoading: boolean
  canLoadFamily: boolean
  onQuickAction: (type: TransactionType) => void
}

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function formatCurrency(value: number): string {
  return idrFormatter.format(value)
}

function SummaryDetails({ data }: { data: SummaryTotals }) {
  return (
    <dl className="balance-card__stats">
      <div>
        <dt>Income</dt>
        <dd>{formatCurrency(data.totalIncome)}</dd>
      </div>
      <div>
        <dt>Expense</dt>
        <dd>{formatCurrency(data.totalExpense)}</dd>
      </div>
      <div>
        <dt>Net</dt>
        <dd>{formatCurrency(data.netBalance)}</dd>
      </div>
    </dl>
  )
}

export function BalanceCards({
  personal,
  family,
  isPersonalLoading,
  isFamilyLoading,
  canLoadFamily,
  onQuickAction,
}: BalanceCardsProps) {
  return (
    <section className="home-balance" aria-label="Ringkasan bulanan">
      <article className="balance-card">
        <p className="balance-card__eyebrow">Personal bulan ini</p>
        <h2 className="balance-card__value">{formatCurrency(personal.netBalance)}</h2>
        {isPersonalLoading ? <p className="balance-card__hint">Memuat transaksi personal...</p> : <SummaryDetails data={personal} />}
      </article>

      <article className="balance-card">
        <p className="balance-card__eyebrow">Family bulan ini</p>
        <h2 className="balance-card__value">{family ? formatCurrency(family.netBalance) : 'Belum tersedia'}</h2>
        {isFamilyLoading ? <p className="balance-card__hint">Memuat summary keluarga...</p> : null}
        {!isFamilyLoading && family ? <SummaryDetails data={family} /> : null}
        {!isFamilyLoading && !family && canLoadFamily ? (
          <p className="balance-card__hint">Summary keluarga belum bisa ditampilkan sekarang.</p>
        ) : null}
        {!canLoadFamily ? (
          <p className="balance-card__hint">Family ID belum tersedia dari sesi. Coba refresh setelah onboarding selesai.</p>
        ) : null}
      </article>

      <div className="home-quick-actions" role="group" aria-label="Quick add transaction">
        <button type="button" className="home-quick-actions__button" onClick={() => onQuickAction('expense')}>
          + Expense
        </button>
        <button type="button" className="home-quick-actions__button" onClick={() => onQuickAction('income')}>
          + Income
        </button>
      </div>
    </section>
  )
}
