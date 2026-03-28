import type { TransactionPeriod } from '../../transactions/api'

type PeriodFilterProps = {
  value: TransactionPeriod
  disabled?: boolean
  onChange: (nextValue: TransactionPeriod) => void
}

const options: Array<{ value: TransactionPeriod; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

export function PeriodFilter({ value, disabled = false, onChange }: PeriodFilterProps) {
  return (
    <div className="period-filter" role="group" aria-label="Filter periode transaksi">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={
            option.value === value
              ? 'period-filter__option period-filter__option--active'
              : 'period-filter__option'
          }
          disabled={disabled}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
