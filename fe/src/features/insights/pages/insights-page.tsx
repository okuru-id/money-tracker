import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'
import { IconTrendingDown, IconTrendingUp, IconWallet, IconReceipt, IconPlus, IconPencil, IconTrash, IconBuildingBank, IconChevronDown } from '@tabler/icons-react'

import { getInsights, getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount, type BankAccount } from '../../transactions/api'

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

const BANK_COLORS = [
  { name: 'BCA', color: '#0066AE' },
  { name: 'Mandiri', color: '#003D79' },
  { name: 'BRI', color: '#00529C' },
  { name: 'BNI', color: '#F15A22' },
  { name: 'Jago', color: '#FF6B00' },
  { name: 'SeaBank', color: '#00AA5B' },
  { name: 'GoPay', color: '#00AED6' },
  { name: 'OVO', color: '#4C3494' },
  { name: 'Dana', color: '#108EE9' },
  { name: 'CIMB', color: '#D20014' },
  { name: 'BCA Syariah', color: '#003D79' },
  { name: 'Mandiri Syariah', color: '#006848' },
  { name: 'BRI Syariah', color: '#003F6D' },
  { name: 'BNI Syariah', color: '#004E7A' },
  { name: 'Sinarmas', color: '#C41E3A' },
  { name: 'BTPN', color: '#FF6600' },
  { name: 'Jenius', color: '#FF4B42' },
  { name: 'T Bank', color: '#00A8E8' },
  { name: 'Miliki', color: '#2196F3' },
  { name: 'Cimb Niaga', color: '#D20014' },
  { name: 'Maybank', color: '#003F70' },
  { name: 'UOB', color: '#DA291C' },
  { name: 'MB Bank', color: '#004B93' },
  { name: 'Bank Danamon', color: '#0066CC' },
  { name: 'Panin Bank', color: '#004B93' },
  { name: 'Permata', color: '#0057A8' },
  { name: 'Commonwealth', color: '#004B93' },
  { name: 'Bii', color: '#0057A8' },
  { name: 'Mandiri Direct', color: '#006848' },
  { name: 'BRI Virtual Account', color: '#00529C' },
  { name: 'BNI VA', color: '#004E7A' },
  { name: 'BCA VA', color: '#0066AE' },
  { name: 'Custom', color: '#4a4a6a' },
]

function getBankColor(name: string): string {
  const found = BANK_COLORS.find((b) => name.toLowerCase().includes(b.name.toLowerCase()))
  return found?.color ?? '#4a4a6a'
}

type BankAccountFormProps = {
  account?: BankAccount
  onSave: (data: { name: string; accountNumber: string; balance: number; color?: string }) => void
  onCancel: () => void
  isLoading: boolean
}

function BankAccountForm({ account, onSave, onCancel, isLoading }: BankAccountFormProps) {
  const [name, setName] = useState(account?.name ?? '')
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber ?? '')
  const [balance, setBalance] = useState(String(account?.balance ?? ''))
  const [color, setColor] = useState(account?.color ?? getBankColor(account?.name ?? '') ?? '#4a4a6a')
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Update form state when account changes (for edit mode)
  useEffect(() => {
    if (account) {
      setName(account.name)
      setAccountNumber(account.accountNumber)
      setBalance(String(account.balance))
      setColor(account.color ?? getBankColor(account.name))
      setShowColorPicker(false)
    } else {
      // Reset for new account
      setName('')
      setAccountNumber('')
      setBalance('')
      setColor(getBankColor(''))
      setShowColorPicker(false)
    }
  }, [account])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), accountNumber: accountNumber.trim(), balance: Number(balance) || 0, color })
  }

  return (
    <form className="bank-form" onSubmit={handleSubmit}>
      <label className="bank-form__field">
        <span>Bank Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. BCA, Mandiri, Jago"
          disabled={isLoading}
        />
      </label>
      <label className="bank-form__field">
        <span>Account Number</span>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="Account number (for transaction matching)"
          disabled={isLoading}
        />
      </label>
      <label className="bank-form__field">
        <span>Balance</span>
        <input
          type="number"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="0"
          disabled={isLoading}
        />
      </label>
      <div className="bank-form__field">
        <span>Color</span>
        <div className="bank-form__color-picker">
          {/* Active Color Preview */}
          <button
            type="button"
            className="bank-form__color-preview"
            onClick={() => setShowColorPicker(!showColorPicker)}
          >
            <div className="bank-form__color-badge" style={{ backgroundColor: color }} />
            <span>Select color</span>
            <IconChevronDown size={14} className="bank-form__color-chevron" />
          </button>

          {/* Color Picker Dropdown */}
          {showColorPicker && (
            <div className="bank-form__color-dropdown">
              <div className="bank-form__color-grid">
                {BANK_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className={`bank-form__color-btn${color === c.color ? ' bank-form__color-btn--active' : ''}`}
                    style={{ backgroundColor: c.color }}
                    onClick={() => {
                      setColor(c.color)
                      setShowColorPicker(false)
                    }}
                    title={c.name}
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bank-form__actions">
        <button type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" disabled={isLoading || !name.trim()}>
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}

export function InsightsPage() {
  const queryClient = useQueryClient()

  const insightsQuery = useQuery({
    queryKey: ['transactions', 'insights'],
    queryFn: getInsights,
  })

  const bankAccountsQuery = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: getBankAccounts,
  })

  const createMutation = useMutation({
    mutationFn: createBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
      setEditingId(null)
      setIsAdding(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; accountNumber: string; balance: number; color?: string } }) =>
      updateBankAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
      setDeletingId(null)
    },
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const sliderRef = useRef<HTMLDivElement | null>(null)

  function handleSliderScroll() {
    const slider = sliderRef.current
    if (!slider) return
    const scrollLeft = slider.scrollLeft
    const cardWidth = slider.offsetWidth
    const index = Math.round(scrollLeft / cardWidth)
    setActiveCardIndex(index)
  }

  const insights = insightsQuery.data
  const bankAccounts = bankAccountsQuery.data ?? []
  const isLoading = insightsQuery.isLoading || bankAccountsQuery.isLoading

  const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.calculatedBalance, 0)

  if (isLoading) {
    return (
      <section className="insights-page" aria-label="Insights">
        <p className="insights-page__hint">Loading insights...</p>
      </section>
    )
  }

  return (
    <section className="insights-page" aria-label="Insights">
      {/* Bank Accounts Section */}
      <div className="bank-accounts-section">
        <div className="bank-accounts-header">
          <h3 className="bank-accounts-title">
            <IconBuildingBank size={20} />
            Bank Accounts
          </h3>
          {!isAdding && (
            <button type="button" className="bank-add-btn" onClick={() => setIsAdding(true)}>
              <IconPlus size={18} />
              Add
            </button>
          )}
        </div>

        {isAdding && (
          <div className="bank-account-form-wrapper">
            <BankAccountForm
              onSave={(data) => createMutation.mutate(data)}
              onCancel={() => setIsAdding(false)}
              isLoading={createMutation.isPending}
            />
          </div>
        )}

        <div className="bank-cards-wrapper">
          <div
            ref={sliderRef}
            className={`bank-cards-grid${bankAccounts.length > 1 ? ' bank-cards-grid--slider' : ''}`}
            onScroll={bankAccounts.length > 1 ? handleSliderScroll : undefined}
          >
            {bankAccounts.map((account) => {
              const isEditing = editingId === account.id
              const isDeleting = deletingId === account.id
              const cardColor = account?.color ?? getBankColor(account?.name ?? '')

              if (isEditing) {
                return (
                  <div key={account.id} className="bank-account-form-wrapper">
                    <BankAccountForm
                      account={account}
                      onSave={(data) => updateMutation.mutate({ id: account.id, data })}
                      onCancel={() => setEditingId(null)}
                      isLoading={updateMutation.isPending}
                    />
                  </div>
                )
              }

              return (
                <article
                  key={account.id}
                  className="bank-card bank-card--custom"
                  style={{ '--bank-color': cardColor } as React.CSSProperties}
                >
                  <div className="bank-card__header">
                    <div className="bank-card__icon">
                      <IconBuildingBank size={22} />
                    </div>
                    <span className="bank-card__label">{account.name}</span>
                  </div>
                  <h2 className="bank-card__amount">{formatAmount(account.calculatedBalance)}</h2>
                  <div className="bank-card__actions">
                    <button
                      type="button"
                      onClick={() => setEditingId(account.id)}
                      disabled={isDeleting}
                      className="bank-card__action-btn"
                    >
                      <IconPencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(account.id)}
                      disabled={isDeleting}
                      className="bank-card__action-btn bank-card__action-btn--danger"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                  {isDeleting && (
                    <div className="bank-card__delete-confirm">
                      <p>Delete {account.name}?</p>
                      <div className="bank-card__delete-actions">
                        <button type="button" onClick={() => setDeletingId(null)}>
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(account.id)}
                          className="bank-card__delete-confirm-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          {bankAccounts.length > 1 && (
            <div className="slider-indicator">
              {bankAccounts.map((_, index) => (
                <span key={index} className={`slider-dot${index === activeCardIndex ? ' slider-dot--active' : ''}`} />
              ))}
            </div>
          )}
        </div>

        {bankAccounts.length > 0 && (
          <div className="bank-total">
            <span>Total Assets</span>
            <strong>{formatAmount(totalBankBalance)}</strong>
          </div>
        )}

        {bankAccounts.length === 0 && !isAdding && (
          <p className="bank-accounts-empty">No bank accounts yet. Add one to track your assets.</p>
        )}
      </div>

      {/* Transaction Insights Cards */}
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
            <span>{insights?.expenseTx ?? 0} transactions</span>
            <span>{formatPercent(insights?.expenseRatio ?? 0)} of income</span>
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
            <span>{insights?.incomeTx ?? 0} transactions</span>
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
            <span>{insights?.totalTx ?? 0} total transactions</span>
          </div>
        </article>

        <article className="bank-card bank-card--transactions">
          <div className="bank-card__header">
            <div className="bank-card__icon">
              <IconReceipt size={22} />
            </div>
            <span className="bank-card__label">Transactions</span>
          </div>
          <h2 className="bank-card__amount">{insights?.totalTx ?? 0}</h2>
          <div className="bank-card__stats">
            <span>Expense: {insights?.expenseTx ?? 0}</span>
            <span>Income: {insights?.incomeTx ?? 0}</span>
          </div>
        </article>
      </div>

      {/* Top Categories */}
      <div className="insights-categories">
        <article className="category-card">
          <h3 className="category-card__title">Top Expense</h3>
          {!insights || insights.topExpense.length === 0 ? (
            <p className="category-card__empty">No expenses yet.</p>
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
            <p className="category-card__empty">No income yet.</p>
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