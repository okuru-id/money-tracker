import { useQuery } from "@tanstack/react-query";
import {
   IconArrowUpRight,
   IconCircleMinus,
   IconCirclePlus,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import {
   getPersonalSummary,
   getTransactions,
   type TransactionItem,
   type TransactionType,
} from "../../transactions/api";
import { usePwaInstallPromptState } from "../../../lib/pwa-install";

import { EmptyState } from "../../../components/empty-state";

const idrFormatter = new Intl.NumberFormat("id-ID", {
   style: "currency",
   currency: "IDR",
   maximumFractionDigits: 0,
});

function formatAmount(value: number): string {
   return idrFormatter.format(value);
}

function formatDate(value: string | null): string {
   if (!value) return "-";
   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return value;
   return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
   }).format(date);
}

const MAX_RECENT = 5;

export function HomePage() {
  const navigate = useNavigate();
  const { isIOS } = usePwaInstallPromptState();

  const summaryQuery = useQuery({
    queryKey: ["transactions", "personal-summary"],
    queryFn: getPersonalSummary,
  });

  const transactionsQuery = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: () => getTransactions({ page: 1, limit: MAX_RECENT }),
  });

  const summary = summaryQuery.data;
  const recentTransactions = transactionsQuery.data ?? [];

  function handleQuickAction(type: TransactionType) {
    navigate(`/add?type=${type}`);
  }

  return (
    <section className="auth-screen auth-screen--split" aria-labelledby="home-title">
      {/* Left panel – dashboard overview */}
      <div className="auth-screen__brand">
        <div className="auth-screen__brand-inner">
          <div className="auth-screen__brand-copy">
            <h2 className="auth-screen__brand-title">Finance cockpit</h2>
            <p className="auth-screen__brand-desc">
              Ringkasan keuangan, aksi cepat, dan riwayat transaksi dalam satu tampilan.
            </p>
          </div>

           {/* Summary card */}
           <article className="home-dashboard__summary">
             <p className="balance-card__eyebrow">Personal balance</p>
             {!summary && <EmptyState message="Belum ada data keuangan. Tambahkan transaksi untuk melihat ringkasan." />}
             {summary && (
               <>
                 <h2 className="balance-card__value">{formatAmount(summary.netBalance)}</h2>
                 <dl className="balance-card__stats">
                   <div>
                     <dt>Income</dt>
                     <dd>{formatAmount(summary.totalIncome)}</dd>
                   </div>
                   <div>
                     <dt>Expense</dt>
                     <dd>{formatAmount(summary.totalExpense)}</dd>
                   </div>
                 </dl>
                 <div className="home-dashboard__chart"><EmptyState message="Tidak ada data grafik saat ini." /></div>
               </>
             )}
           </article>
        </div>
      </div>

      {/* Right panel – actions & recent */}
      <div className="auth-screen__main">
        <div className="auth-screen__main-inner">
          <div className="home-quick-actions" role="group" aria-label="Quick add transaction">
            <button
              type="button"
              className="home-quick-actions__button home-quick-actions__button--expense"
              onClick={() => handleQuickAction("debit")}
            >
              <IconCircleMinus size={20} />
              <span>Expense</span>
            </button>
            <button
              type="button"
              className="home-quick-actions__button home-quick-actions__button--income"
              onClick={() => handleQuickAction("credit")}
            >
              <IconCirclePlus size={20} />
              <span>Income</span>
            </button>
          </div>

          <section className="home-recent" aria-label="Recent transactions">
            <div className="home-recent__header">
              <div>
                <p className="home-recent__eyebrow">Recent activity</p>
                <h3>Recent Transactions</h3>
              </div>
              {recentTransactions.length > 0 && (
                <button
                  type="button"
                  className={isIOS ? "home-recent__link" : "home-recent__link home-recent__link--android"}
                  onClick={() => navigate("/history")}
                >
                  <span>View all</span>
                  <IconArrowUpRight size={16} />
                </button>
              )}
            </div>

            {transactionsQuery.isLoading && <p className="home-recent__hint">Loading transactions...</p>}
            {!transactionsQuery.isLoading && recentTransactions.length === 0 && (
              <div className="home-recent__empty">
                <EmptyState message="Tidak ada transaksi terbaru. Tambahkan transaksi untuk melihat di sini." />
              </div>
            )}

            <div className="home-recent__list">
              {recentTransactions.map((tx: TransactionItem) => (
                <article key={tx.id} className="home-recent__item">
                  <div className="home-recent__item-info">
                    <p className="home-recent__item-category">{tx.categoryName || "No category"}</p>
                    <p className="home-recent__item-date">{formatDate(tx.transactionDate ?? tx.createdAt)}</p>
                  </div>
                  <p
                    className={
                      tx.type === "credit"
                        ? "home-recent__item-amount home-recent__item-amount--income"
                        : "home-recent__item-amount home-recent__item-amount--expense"
                    }
                  >
                    {tx.type === "credit" ? "+" : "-"}
                    {formatAmount(tx.amount)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
