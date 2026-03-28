import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { IconTrendingDown, IconTrendingUp, IconWallet, IconReceipt, IconPlus, IconPencil, IconTrash, IconBuildingBank } from '@tabler/icons-react'

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
]

function getBankColor(name: string): string {
  const found = BANK_COLORS.find((b) => name.toLowerCase().includes(b.name.toLowerCase()))
  return found?.color ?? '#4a4a6a'
}

type BankAccountFormProps = {
  account?: BankAccount
  onSave: (data: { name: string; accountNumber: string; balance: number }) => void
  onCancel: () => void
  isLoading: boolean
}

function BankAccountForm({ account, onSave, onCancel, isLoading }: BankAccountFormProps) {
  const [name, setName] = useState(account?.name ?? '')
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber ?? '')
  const [balance, setBalance] = useState(String(account?.balance ?? ''))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), accountNumber: accountNumber.trim(), balance: Number(balance) || 0 })
  }

  return (
    <form className="bank-form" onSubmit={handleSubmit}>
      <label className="bank-form__field">
        <span>Nama Bank</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: BCA, Mandiri, Jago"
          disabled={isLoading}
        />
      </label>
      <label className="bank-form__field">
        <span>No. Rekening</span>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="Nomor rekening (untuk match transaksi)"
          disabled={isLoading}
        />
      </label>
      <label className="bank-form__field">
        <span>Saldo</span>
        <input
          type="number"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="0"
          disabled={isLoading}
        />
      </label>
      <div className="bank-form__actions">
        <button type="button" onClick={onCancel} disabled={isLoading}>
          Batal
        </button>
        <button type="submit" disabled={isLoading || !name.trim()}>
          {isLoading ? 'Menyimpan...' : 'Simpan'}
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
    mutationFn: ({ id, data }: { id: string; data: { name: string; accountNumber: string; balance: number } }) =>
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

  const insights = insightsQuery.data
  const bankAccounts = bankAccountsQuery.data ?? []
  const isLoading = insightsQuery.isLoading || bankAccountsQuery.isLoading

  const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0)

  if (isLoading) {
    return (
      <section className="insights-page" aria-label="Insights">
        <p className="insights-page__hint">Memuat data insights...</p>
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
              Tambah
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

        <div className="bank-cards-grid">
          {bankAccounts.map((account) => {
            const isEditing = editingId === account.id
            const isDeleting = deletingId === account.id
            const color = account.color ?? getBankColor(account.name)

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
                style={{ '--bank-color': color } as React.CSSProperties}
              >
                <div className="bank-card__header">
                  <div className="bank-card__icon">
                    <IconBuildingBank size={22} />
                  </div>
                  <span className="bank-card__label">{account.name}</span>
                </div>
                <h2 className="bank-card__amount">{formatAmount(account.balance)}</h2>
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
                    <p>Hapus {account.name}?</p>
                    <div className="bank-card__delete-actions">
                      <button type="button" onClick={() => setDeletingId(null)}>
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(account.id)}
                        className="bank-card__delete-confirm-btn"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>

        {bankAccounts.length > 0 && (
          <div className="bank-total">
            <span>Total Aset</span>
            <strong>{formatAmount(totalBankBalance)}</strong>
          </div>
        )}

        {bankAccounts.length === 0 && !isAdding && (
          <p className="bank-accounts-empty">Belum ada bank account. Tambahkan untuk melacak aset.</p>
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

      {/* Top Categories */}
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