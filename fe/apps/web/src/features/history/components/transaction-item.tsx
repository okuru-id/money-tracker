import { useMemo, useState, type FormEvent } from 'react'

import { Dropdown } from '../../../components/dropdown'
import type { CategoryItem, TransactionItem as TransactionRow } from '../../transactions/api'

type TransactionItemProps = {
  transaction: TransactionRow
  categories: CategoryItem[]
  canEdit: boolean
  isSaving: boolean
  onSave: (payload: { id: string; amount: number; categoryId: string | null; notes?: string }) => Promise<void>
}

function formatAmount(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string | null): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function TransactionItem({ transaction, categories, canEdit, isSaving, onSave }: TransactionItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [amountInput, setAmountInput] = useState(String(transaction.amount || ''))
  const [categoryId, setCategoryId] = useState(transaction.categoryId ?? '')
  const [notes, setNotes] = useState(transaction.notes)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Map legacy types to category types: debit -> expense, credit -> income
  const categoryType = transaction.type === 'debit' ? 'expense' : transaction.type === 'credit' ? 'income' : transaction.type

  const categoryOptions = useMemo(
    () => categories.filter((item) => item.type === categoryType),
    [categories, categoryType],
  )

  async function handleSave(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const amount = Number(amountInput)
    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage('Nominal harus lebih besar dari 0.')
      return
    }

    if (!categoryId) {
      setErrorMessage('Kategori wajib dipilih.')
      return
    }

    setErrorMessage(null)

    try {
      await onSave({
        id: transaction.id,
        amount,
        categoryId,
        notes: notes.trim() || undefined,
      })
      setIsEditing(false)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Gagal memperbarui transaksi. Coba lagi.')
      }
    }
  }

  function resetEditor(): void {
    setAmountInput(String(transaction.amount || ''))
    setCategoryId(transaction.categoryId ?? '')
    setNotes(transaction.notes)
    setErrorMessage(null)
    setIsEditing(false)
  }

  return (
    <article className="history-transaction-item">
      <header className="history-transaction-item__header">
        <div>
          <p className="history-transaction-item__category">{transaction.categoryName || 'Tanpa kategori'}</p>
          <p className="history-transaction-item__date">{formatDate(transaction.transactionDate ?? transaction.createdAt)}</p>
        </div>
        <div className="history-transaction-item__amount-wrap">
          <p
            className={
              transaction.type === 'income'
                ? 'history-transaction-item__amount history-transaction-item__amount--income'
                : 'history-transaction-item__amount history-transaction-item__amount--expense'
            }
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatAmount(transaction.amount)}
          </p>
          {canEdit ? (
            <button type="button" className="history-transaction-item__edit-button" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          ) : null}
        </div>
      </header>

      {transaction.notes ? <p className="history-transaction-item__notes">{transaction.notes}</p> : null}

      {isEditing ? (
        <form className="history-transaction-item__editor" onSubmit={handleSave}>
          <label className="history-transaction-item__field">
            <span>Nominal</span>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              disabled={isSaving}
            />
          </label>

          <Dropdown
              label="Kategori"
              placeholder="Pilih kategori"
              value={categoryId}
              onChange={setCategoryId}
              disabled={isSaving}
              options={categoryOptions.map((opt) => ({ value: opt.id, label: opt.name }))}
            />

          <label className="history-transaction-item__field">
            <span>Catatan</span>
            <input value={notes} onChange={(event) => setNotes(event.target.value)} disabled={isSaving} />
          </label>

          {errorMessage ? <p className="history-transaction-item__error">{errorMessage}</p> : null}

          <div className="history-transaction-item__actions">
            <button type="button" onClick={resetEditor} disabled={isSaving}>
              Batal
            </button>
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      ) : null}
    </article>
  )
}
