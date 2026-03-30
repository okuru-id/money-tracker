import { useMemo, useState, type FormEvent } from 'react'

import { Dropdown } from '../../../components/dropdown'
import type { CategoryItem, TransactionItem as TransactionRow } from '../../transactions/api'

type TransactionItemProps = {
  transaction: TransactionRow
  categories: CategoryItem[]
  canEdit: boolean
  canDelete: boolean
  isSaving: boolean
  isDeleting: boolean
  onSave: (payload: { id: string; amount: number; categoryId: string | null; notes?: string }) => Promise<void>
  onDelete: () => Promise<void>
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

function formatFullDate(value: string | null): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function TransactionItem({ transaction, categories, canEdit, canDelete, isSaving, isDeleting, onSave, onDelete }: TransactionItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [amountInput, setAmountInput] = useState(String(transaction.amount || ''))
  const [categoryId, setCategoryId] = useState(transaction.categoryId ?? '')
  const [notes, setNotes] = useState(transaction.notes)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Map transaction types to category types: debit -> expense, credit -> income
  const isCredit = transaction.type === 'credit'

  const categoryOptions = useMemo(
    () => categories.filter((item) => item.type === (isCredit ? 'income' : 'expense')),
    [categories, isCredit],
  )

  const displayBankName = transaction.bankAccountName || transaction.bankName || ''

  async function handleSave(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const amount = Number(amountInput)
    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage('Amount must be greater than 0.')
      return
    }

    if (!categoryId) {
      setErrorMessage('Category is required.')
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
        setErrorMessage('Failed to update transaction. Please try again.')
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

  async function handleDelete(): Promise<void> {
    setErrorMessage(null)
    try {
      await onDelete()
      setIsConfirmingDelete(false)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Failed to delete transaction. Please try again.')
      }
    }
  }

  return (
    <>
      <article className="history-transaction-item">
        <header
          className="history-transaction-item__header"
          onClick={() => setShowDetail(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setShowDetail(true) }}
        >
          <div>
            <p className="history-transaction-item__category">{transaction.categoryName || 'No category'}</p>
            <p className="history-transaction-item__date">{formatDate(transaction.transactionDate ?? transaction.createdAt)}</p>
          </div>
          <div className="history-transaction-item__amount-wrap">
            <p
              className={
                transaction.type === 'credit'
                  ? 'history-transaction-item__amount history-transaction-item__amount--income'
                  : 'history-transaction-item__amount history-transaction-item__amount--expense'
              }
            >
              {transaction.type === 'credit' ? '+' : '-'}
              {formatAmount(transaction.amount)}
            </p>
            {canEdit ? (
              <button
                type="button"
                className="history-transaction-item__edit-button"
                onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
              >
                Edit
              </button>
            ) : null}
            {canDelete && !isConfirmingDelete ? (
              <button
                type="button"
                className="history-transaction-item__delete-button"
                onClick={(e) => { e.stopPropagation(); setIsConfirmingDelete(true) }}
              >
                Delete
              </button>
            ) : null}
          </div>
        </header>

        {transaction.notes ? <p className="history-transaction-item__notes">{transaction.notes}</p> : null}

        {transaction.accountNumber ? (
          <p className="history-transaction-item__account" onClick={() => setShowDetail(true)} role="button" tabIndex={0}>
            <span className="history-transaction-item__account-label">Rekening:</span>{' '}
            {displayBankName ? `${displayBankName} - ` : ''}{transaction.accountNumber}
          </p>
        ) : null}

        {isConfirmingDelete ? (
          <div className="history-transaction-item__delete-confirm">
            <p>Are you sure you want to delete this transaction?</p>
            <div className="history-transaction-item__actions">
              <button type="button" onClick={() => setIsConfirmingDelete(false)} disabled={isDeleting}>
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={isDeleting} className="history-transaction-item__delete-confirm-btn">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ) : null}

        {isEditing ? (
          <form className="history-transaction-item__editor" onSubmit={handleSave}>
            <label className="history-transaction-item__field">
              <span>Amount</span>
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
                label="Category"
                placeholder="Select category"
                value={categoryId}
                onChange={setCategoryId}
                disabled={isSaving}
                options={categoryOptions.map((opt) => ({ value: opt.id, label: opt.name }))}
              />

            <label className="history-transaction-item__field">
              <span>Notes</span>
              <input value={notes} onChange={(event) => setNotes(event.target.value)} disabled={isSaving} />
            </label>

            {errorMessage ? <p className="history-transaction-item__error">{errorMessage}</p> : null}

            <div className="history-transaction-item__actions">
              <button type="button" onClick={resetEditor} disabled={isSaving}>
                Cancel
              </button>
              <button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : null}
      </article>

      {showDetail ? (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDetail(false)} aria-label="Close">
              &times;
            </button>
            <h3 className="history-detail-modal__title">Transaction Details</h3>
            <div className="history-detail-modal__grid">
              <div className="history-detail-modal__row">
                <span className="history-detail-modal__label">Category</span>
                <span className="history-detail-modal__value">{transaction.categoryName || '-'}</span>
              </div>
              <div className="history-detail-modal__row">
                <span className="history-detail-modal__label">Type</span>
                <span className={`history-detail-modal__value history-detail-modal__value--${transaction.type === 'credit' ? 'income' : 'expense'}`}>
                  {transaction.type === 'credit' ? 'Income' : 'Expense'}
                </span>
              </div>
              <div className="history-detail-modal__row">
                <span className="history-detail-modal__label">Amount</span>
                <span className={`history-detail-modal__value history-detail-modal__value--${transaction.type === 'credit' ? 'income' : 'expense'}`}>
                  {transaction.type === 'credit' ? '+' : '-'}{formatAmount(transaction.amount)}
                </span>
              </div>
              {transaction.accountNumber ? (
                <div className="history-detail-modal__row">
                  <span className="history-detail-modal__label">Bank</span>
                  <span className="history-detail-modal__value">{displayBankName || '-'}</span>
                </div>
              ) : null}
              {transaction.accountNumber ? (
                <div className="history-detail-modal__row">
                  <span className="history-detail-modal__label">Account No.</span>
                  <span className="history-detail-modal__value history-detail-modal__value--mono">{transaction.accountNumber}</span>
                </div>
              ) : null}
              <div className="history-detail-modal__row">
                <span className="history-detail-modal__label">Date</span>
                <span className="history-detail-modal__value">{formatFullDate(transaction.transactionDate ?? transaction.createdAt)}</span>
              </div>
              {transaction.notes ? (
                <div className="history-detail-modal__row">
                  <span className="history-detail-modal__label">Notes</span>
                  <span className="history-detail-modal__value">{transaction.notes}</span>
                </div>
              ) : null}
            </div>
            <button className="history-detail-modal__close-btn" onClick={() => setShowDetail(false)}>
              Tutup
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
