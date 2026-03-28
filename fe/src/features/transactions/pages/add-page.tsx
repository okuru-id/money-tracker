import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'

import { pickFavoriteCategories } from '../../categories/favorites'
import { ApiError } from '../../auth/api'
import { AmountInput } from '../components/amount-input'
import { CategoryPicker } from '../components/category-picker'
import {
  createTransaction,
  getCategories,
  getTransactions,
  isNetworkFailure,
  type TransactionType,
} from '../api'
import { trackKpiEvent } from '../../../lib/analytics'
import { showToast } from '../../../lib/toast'

const LAST_USED_TYPE_STORAGE_KEY = 'money-tracker.last-transaction-type'

function readStoredLastUsedType(): TransactionType | null {
  if (typeof window === 'undefined') {
    return null
  }

  const stored = window.localStorage.getItem(LAST_USED_TYPE_STORAGE_KEY)
  if (stored === 'income' || stored === 'expense') {
    return stored
  }

  return null
}

function persistLastUsedType(type: TransactionType): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LAST_USED_TYPE_STORAGE_KEY, type)
}

function parseTypeParam(value: string | null): TransactionType | null {
  if (value === 'income' || value === 'expense') {
    return value
  }

  return null
}

function formatToday(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  return 'Gagal menyimpan transaksi. Coba lagi beberapa saat lagi.'
}

export function AddPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const typeFromQuery = parseTypeParam(searchParams.get('type'))
  const storedLastUsedType = useMemo(() => readStoredLastUsedType(), [])

  const transactionsQuery = useQuery({
    queryKey: ['transactions', 'recent-for-add'],
    queryFn: () => getTransactions({ period: 'month' }),
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getCategories,
  })

  const recentDefaultType = useMemo(() => {
    const latestType = transactionsQuery.data?.[0]?.type
    return latestType === 'income' || latestType === 'expense' ? latestType : null
  }, [transactionsQuery.data])

  const [manualType, setManualType] = useState<TransactionType | null>(() => storedLastUsedType)
  const [amountInput, setAmountInput] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [notes, setNotes] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryMode, setRetryMode] = useState(false)
  const [hasSwitchedTypeBeforeSubmit, setHasSwitchedTypeBeforeSubmit] = useState(false)
  const submitStartedAtRef = useRef<number | null>(null)
  const type = typeFromQuery ?? manualType ?? recentDefaultType ?? 'expense'

  function finishSubmitTimer(): number {
    const startedAt = submitStartedAtRef.current
    submitStartedAtRef.current = null

    if (startedAt === null) {
      return 0
    }

    return Math.max(0, Math.round(performance.now() - startedAt))
  }

  useEffect(() => {
    trackKpiEvent('open_add')
  }, [])

  const favorites = useMemo(
    () => pickFavoriteCategories(transactionsQuery.data ?? [], categoriesQuery.data ?? [], type),
    [transactionsQuery.data, categoriesQuery.data, type],
  )

  const submitMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      const durationMs = finishSubmitTimer()

      persistLastUsedType(type)
      setRetryMode(false)
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['transactions'] })
      void queryClient.invalidateQueries({ queryKey: ['family-summary'] })

      trackKpiEvent('submit_success', {
        amount: amountValue,
        categoryId,
      })
      trackKpiEvent('time_to_submit_ms', {
        durationMs,
      })

      showToast({
        title: 'Transaksi berhasil disimpan',
        description: 'Kamu bisa lanjut input berikutnya tanpa keluar dari layar Add.',
        action: {
          label: 'Add Another',
          onClick: () => {
            setAmountInput('')
            setCategoryId('')
            setNotes('')
          },
        },
      })
    },
    onError: (error) => {
      const networkFailure = isNetworkFailure(error)
      const message = toErrorMessage(error)
      const durationMs = finishSubmitTimer()

      setErrorMessage(message)
      setRetryMode(networkFailure)

      trackKpiEvent('submit_fail', {
        amount: amountValue,
        categoryId,
        retryMode: networkFailure,
        errorCode: error instanceof ApiError ? error.code : undefined,
        errorMessage: message,
      })
      trackKpiEvent('time_to_submit_ms', {
        durationMs,
      })

      showToast({
        title: 'Transaksi belum tersimpan',
        description: message,
      })
    },
  })

  const amountValue = Number(amountInput || 0)

  const canSubmit = amountValue > 0 && categoryId.length > 0 && !submitMutation.isPending

  function submitCurrentForm(): void {
    setErrorMessage(null)
    setRetryMode(false)
    submitStartedAtRef.current = performance.now()

    submitMutation.mutate({
      amount: amountValue,
      type,
      categoryId,
      notes: notes.trim() || undefined,
      transactionDate: formatToday(),
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!canSubmit) {
      return
    }

    submitCurrentForm()
  }

  return (
    <section className="add-page" aria-labelledby="add-page-title">
      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="transaction-form__type-toggle" role="group" aria-label="Transaction type">
          <button
            type="button"
            className={type === 'expense' ? 'transaction-form__type-button transaction-form__type-button--active' : 'transaction-form__type-button'}
            onClick={() => {
              setManualType('expense')
              if (typeFromQuery) {
                const next = new URLSearchParams(searchParams)
                next.delete('type')
                setSearchParams(next, { replace: true })
              }
              if (!submitMutation.isSuccess && !hasSwitchedTypeBeforeSubmit && type !== 'expense') {
                setHasSwitchedTypeBeforeSubmit(true)
                trackKpiEvent('type_switch_before_submit', {
                  switchedToType: 'expense',
                })
              }
            }}
          >
            Expense
          </button>
          <button
            type="button"
            className={type === 'income' ? 'transaction-form__type-button transaction-form__type-button--active' : 'transaction-form__type-button'}
            onClick={() => {
              setManualType('income')
              if (typeFromQuery) {
                const next = new URLSearchParams(searchParams)
                next.delete('type')
                setSearchParams(next, { replace: true })
              }
              if (!submitMutation.isSuccess && !hasSwitchedTypeBeforeSubmit && type !== 'income') {
                setHasSwitchedTypeBeforeSubmit(true)
                trackKpiEvent('type_switch_before_submit', {
                  switchedToType: 'income',
                })
              }
            }}
          >
            Income
          </button>
        </div>

        <AmountInput value={amountInput} onChange={setAmountInput} autoFocus />

        <CategoryPicker
          type={type}
          categories={categoriesQuery.data ?? []}
          favoriteCategories={favorites}
          selectedCategoryId={categoryId}
          onSelect={setCategoryId}
          isLoading={categoriesQuery.isLoading}
        />

        <label className="transaction-form__field" htmlFor="notes-input">
          <span>Catatan (opsional)</span>
          <input
            id="notes-input"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Contoh: makan siang tim"
          />
        </label>

        {errorMessage ? <p className="transaction-form__error">{errorMessage}</p> : null}

        {retryMode ? (
          <div className="transaction-form__retry" role="alert">
            <p>Jaringan sedang bermasalah. Form tetap disimpan di layar ini.</p>
            <button
              type="button"
              className="transaction-form__retry-button"
              onClick={() => {
                if (!submitMutation.isPending) {
                  submitCurrentForm()
                }
              }}
            >
              Retry
            </button>
          </div>
        ) : null}

        <button className="transaction-form__submit" type="submit" disabled={!canSubmit}>
          {submitMutation.isPending ? 'Menyimpan...' : 'Simpan transaksi'}
        </button>
      </form>
    </section>
  )
}
