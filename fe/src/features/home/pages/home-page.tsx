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
      <div className="home-page">
         <div className="home-page__desktop-top">
            <section className="home-hero" aria-label="Summary hero">
               <div className="home-hero__copy">
                  <p className="page-card__eyebrow">Dashboard</p>
                  <h1 className="home-hero__title">
                     See cash flow and next action at a glance.
                  </h1>
                  <p className="home-hero__description">
                     Monitor balance, jump into new entries, and review the
                     latest activity from one workspace.
                  </p>
               </div>

               <article className="home-hero__summary-card">
                  <div className="home-hero__summary-copy">
                     <p className="balance-card__eyebrow">Personal balance</p>
                     <h2 className="balance-card__value">
                        {summary ? formatAmount(summary.netBalance) : "-"}
                     </h2>
                     <p className="balance-card__hint">
                        Saldo bersih bulan ini dari semua transaksi yang sudah
                        tercatat.
                     </p>
                  </div>

                  {summaryQuery.isLoading ? (
                     <p className="balance-card__hint">
                        Loading transactions...
                     </p>
                  ) : summary ? (
                     <dl className="balance-card__stats">
                        <div>
                           <dt>Expense</dt>
                           <dd>{formatAmount(summary.totalExpense)}</dd>
                        </div>
                        <div>
                           <dt>Income</dt>
                           <dd>{formatAmount(summary.totalIncome)}</dd>
                        </div>
                     </dl>
                  ) : null}
               </article>
            </section>

            <div className="home-page__desktop-side">
               <section className="home-balance" aria-label="Highlights">
                  <article className="balance-card balance-card--dark">
                     <div className="balance-card__topline">
                        <p className="balance-card__eyebrow">Focus today</p>
                        <span className="balance-card__badge">Live</span>
                     </div>
                     <h2 className="balance-card__value">
                        {summary ? formatAmount(summary.totalIncome) : "-"}
                     </h2>
                     <p className="balance-card__hint">
                        Income yang sudah masuk selama periode aktif.
                     </p>
                  </article>

                  <article className="balance-card balance-card--soft">
                     <p className="balance-card__eyebrow">Control expense</p>
                     <h2 className="balance-card__value">
                        {summary ? formatAmount(summary.totalExpense) : "-"}
                     </h2>
                     <p className="balance-card__hint">
                        Pantau pengeluaran agar pergerakan saldo tetap terasa
                        aman.
                     </p>
                  </article>
               </section>

               <div
                  className="home-quick-actions"
                  role="group"
                  aria-label="Quick add transaction"
               >
                  <button
                     type="button"
                     className="home-quick-actions__button"
                     onClick={() => handleQuickAction("debit")}
                  >
                     <IconCircleMinus size={20} />
                     <span>Expense</span>
                  </button>
                  <button
                     type="button"
                     className="home-quick-actions__button"
                     onClick={() => handleQuickAction("credit")}
                  >
                     <IconCirclePlus size={20} />
                     <span>Income</span>
                  </button>
               </div>
            </div>
         </div>

         <section className="home-recent" aria-label="Recent transactions">
            <div className="home-recent__header">
               <div>
                  <p className="home-recent__eyebrow">Recent activity</p>
                  <h3>Recent Transactions</h3>
               </div>
                {recentTransactions.length > 0 ? (
                   <button
                      type="button"
                      className={
                         isIOS
                            ? "home-recent__link"
                            : "home-recent__link home-recent__link--android"
                      }
                      onClick={() => navigate("/history")}
                   >
                     <span>View all</span>
                     <IconArrowUpRight size={16} />
                  </button>
               ) : null}
            </div>

            {transactionsQuery.isLoading ? (
               <p className="home-recent__hint">Loading transactions...</p>
            ) : null}

            {!transactionsQuery.isLoading && recentTransactions.length === 0 ? (
               <EmptyState message="No transactions yet." />
            ) : null}

            <div className="home-recent__list">
               {recentTransactions.map((tx: TransactionItem) => (
                  <article key={tx.id} className="home-recent__item">
                     <div className="home-recent__item-info">
                        <p className="home-recent__item-category">
                           {tx.categoryName || "No category"}
                        </p>
                        <p className="home-recent__item-date">
                           {formatDate(tx.transactionDate ?? tx.createdAt)}
                        </p>
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
   );
}
