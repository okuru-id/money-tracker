type AmountInputProps = {
  value: string
  onChange: (nextValue: string) => void
  autoFocus?: boolean
}

function normalizeAmountInput(rawValue: string): string {
  const digits = rawValue.replace(/[^0-9]/g, '')

  if (!digits) {
    return ''
  }

  return String(Number(digits))
}

export function AmountInput({ value, onChange, autoFocus = false }: AmountInputProps) {
  const numericValue = Number(value || 0)
  const formattedPreview =
    numericValue > 0
      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
          numericValue,
        )
      : 'Rp0'

  return (
    <label className="transaction-form__field" htmlFor="amount-input">
      <span>Jumlah</span>
      <input
        id="amount-input"
        autoFocus={autoFocus}
        inputMode="numeric"
        autoComplete="off"
        placeholder="Contoh: 75000"
        value={value}
        onChange={(event) => onChange(normalizeAmountInput(event.target.value))}
        required
      />
      <strong className="transaction-form__preview">{formattedPreview}</strong>
    </label>
  )
}
