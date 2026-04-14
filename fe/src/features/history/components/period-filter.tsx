import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

type MonthNavigatorProps = {
  year: number
  month: number // 0-indexed
  disabled?: boolean
  onChange: (year: number, month: number) => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function MonthNavigator({ year, month, disabled = false, onChange }: MonthNavigatorProps) {
  function goBack() {
    if (month === 0) {
      onChange(year - 1, 11)
    } else {
      onChange(year, month - 1)
    }
  }

  function goForward() {
    if (month === 11) {
      onChange(year + 1, 0)
    } else {
      onChange(year, month + 1)
    }
  }

  return (
    <div className="month-navigator" role="group" aria-label="Month navigation">
      <div className="month-navigator__copy">
        <p className="month-navigator__eyebrow">Selected period</p>
        <span className="month-navigator__label">{MONTH_NAMES[month]} {year}</span>
      </div>
      <div className="month-navigator__actions">
        <button type="button" className="month-navigator__button" disabled={disabled} onClick={goBack} aria-label="Previous month">
          <IconChevronLeft size={20} />
        </button>
        <button type="button" className="month-navigator__button" disabled={disabled} onClick={goForward} aria-label="Next month">
          <IconChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
