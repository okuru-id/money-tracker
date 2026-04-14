import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { pickFavoriteCategories } from "../../categories/favorites";
import { ApiError } from "../../auth/api";
import { Dropdown } from "../../../components/dropdown";
import { AmountInput } from "../components/amount-input";
import { CategoryPicker } from "../components/category-picker";
import {
   createTransaction,
   getCategories,
   getTransactions,
   getBankAccounts,
   isNetworkFailure,
   type TransactionType,
   type BankAccount,
} from "../api";
import { trackKpiEvent } from "../../../lib/analytics";
import { showToast } from "../../../lib/toast";

const LAST_USED_TYPE_STORAGE_KEY = "money-tracker.last-transaction-type";

/** Map transaction type (debit/credit) to category type (expense/income) */
function toCategoryType(txType: TransactionType): "income" | "expense" {
   return txType === "credit" ? "income" : "expense";
}

function readStoredLastUsedType(): TransactionType | null {
   if (typeof window === "undefined") {
      return null;
   }

   const stored = window.localStorage.getItem(LAST_USED_TYPE_STORAGE_KEY);
   if (stored === "debit" || stored === "credit") {
      return stored;
   }

   return null;
}

function persistLastUsedType(type: TransactionType): void {
   if (typeof window === "undefined") {
      return;
   }

   window.localStorage.setItem(LAST_USED_TYPE_STORAGE_KEY, type);
}

function parseTypeParam(value: string | null): TransactionType | null {
   if (value === "debit" || value === "credit") {
      return value;
   }

   return null;
}

function formatToday(): string {
   const now = new Date();
   const year = now.getFullYear();
   const month = String(now.getMonth() + 1).padStart(2, "0");
   const day = String(now.getDate()).padStart(2, "0");
   return `${year}-${month}-${day}`;
}

function toErrorMessage(error: unknown): string {
   if (error instanceof ApiError) {
      return error.message;
   }

   return "Failed to save transaction. Please try again later.";
}

function getBankAccountNumberOptions(
   accounts: BankAccount[],
): Array<{ value: string; label: string }> {
   return accounts.flatMap((account) =>
      account.accountNumbers.map((accountNumber) => ({
         value: accountNumber,
         label: `${account.name} - ${accountNumber}`,
      })),
   );
}

export function AddPage() {
   const queryClient = useQueryClient();
   const navigate = useNavigate();
   const [searchParams, setSearchParams] = useSearchParams();
   const typeFromQuery = parseTypeParam(searchParams.get("type"));
   const storedLastUsedType = useMemo(() => readStoredLastUsedType(), []);

   const transactionsQuery = useQuery({
      queryKey: ["transactions", "recent-for-add"],
      queryFn: () => getTransactions({ period: "month" }),
   });

   const categoriesQuery = useQuery({
      queryKey: ["categories", "all"],
      queryFn: getCategories,
   });

   const bankAccountsQuery = useQuery({
      queryKey: ["bank-accounts"],
      queryFn: getBankAccounts,
   });

   const recentDefaultType = useMemo(() => {
      const latestType = transactionsQuery.data?.[0]?.type;
      return latestType === "debit" || latestType === "credit"
         ? latestType
         : null;
   }, [transactionsQuery.data]);

   const [manualType, setManualType] = useState<TransactionType | null>(
      () => storedLastUsedType,
   );
   const [amountInput, setAmountInput] = useState("");
   const [categoryId, setCategoryId] = useState("");
   const [selectedBankAccountNumber, setSelectedBankAccountNumber] =
      useState("");
   const [notes, setNotes] = useState("");
   const [errorMessage, setErrorMessage] = useState<string | null>(null);
   const [retryMode, setRetryMode] = useState(false);
   const [hasSwitchedTypeBeforeSubmit, setHasSwitchedTypeBeforeSubmit] =
      useState(false);
   const submitStartedAtRef = useRef<number | null>(null);
   const type = typeFromQuery ?? manualType ?? recentDefaultType ?? "debit";

   function finishSubmitTimer(): number {
      const startedAt = submitStartedAtRef.current;
      submitStartedAtRef.current = null;

      if (startedAt === null) {
         return 0;
      }

      return Math.max(0, Math.round(performance.now() - startedAt));
   }

   useEffect(() => {
      trackKpiEvent("open_add");
   }, []);

   const categoryType = toCategoryType(type);
   const favorites = useMemo(
      () =>
         pickFavoriteCategories(
            transactionsQuery.data ?? [],
            categoriesQuery.data ?? [],
            categoryType,
         ),
      [transactionsQuery.data, categoriesQuery.data, categoryType],
   );
   const bankAccountNumberOptions = useMemo(
      () => getBankAccountNumberOptions(bankAccountsQuery.data ?? []),
      [bankAccountsQuery.data],
   );

   const submitMutation = useMutation({
      mutationFn: createTransaction,
      onSuccess: () => {
         const durationMs = finishSubmitTimer();

         persistLastUsedType(type);
         setRetryMode(false);
         setErrorMessage(null);
         void queryClient.invalidateQueries({ queryKey: ["transactions"] });
         void queryClient.invalidateQueries({ queryKey: ["family-summary"] });
         void queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });

         trackKpiEvent("submit_success", {
            amount: amountValue,
            categoryId,
         });
         trackKpiEvent("time_to_submit_ms", {
            durationMs,
         });

         showToast({
            title: "Transaction saved successfully",
         });

         navigate("/");
      },
      onError: (error) => {
         const networkFailure = isNetworkFailure(error);
         const message = toErrorMessage(error);
         const durationMs = finishSubmitTimer();

         setErrorMessage(message);
         setRetryMode(networkFailure);

         trackKpiEvent("submit_fail", {
            amount: amountValue,
            categoryId,
            retryMode: networkFailure,
            errorCode: error instanceof ApiError ? error.code : undefined,
            errorMessage: message,
         });
         trackKpiEvent("time_to_submit_ms", {
            durationMs,
         });

         showToast({
            title: "Transaction not saved",
            description: message,
         });
      },
   });

   const amountValue = Number(amountInput || 0);

   const canSubmit =
      amountValue > 0 && categoryId.length > 0 && !submitMutation.isPending;

   function submitCurrentForm(): void {
      setErrorMessage(null);
      setRetryMode(false);
      submitStartedAtRef.current = performance.now();

      submitMutation.mutate({
         amount: amountValue,
         type,
         categoryId,
         notes: notes.trim() || undefined,
         transactionDate: formatToday(),
         accountNumber: selectedBankAccountNumber || undefined,
      });
   }

   function handleSubmit(event: FormEvent<HTMLFormElement>): void {
      event.preventDefault();
      if (!canSubmit) {
         return;
      }

      submitCurrentForm();
   }

   return (
      <section className="add-page">
         <form className="transaction-form" onSubmit={handleSubmit}>
            <section className="transaction-form__section transaction-form__section--hero">
               <div
                  className="transaction-form__type-toggle"
                  role="group"
                  aria-label="Transaction type"
               >
                  <button
                     type="button"
                     className={
                        type === "debit"
                           ? "transaction-form__type-button transaction-form__type-button--active"
                           : "transaction-form__type-button"
                     }
                     onClick={() => {
                        setManualType("debit");
                        if (typeFromQuery) {
                           const next = new URLSearchParams(searchParams);
                           next.delete("type");
                           setSearchParams(next, { replace: true });
                        }
                        if (
                           !submitMutation.isSuccess &&
                           !hasSwitchedTypeBeforeSubmit &&
                           type !== "debit"
                        ) {
                           setHasSwitchedTypeBeforeSubmit(true);
                           trackKpiEvent("type_switch_before_submit", {
                              switchedToType: "debit",
                           });
                        }
                     }}
                  >
                     Expense
                  </button>
                  <button
                     type="button"
                     className={
                        type === "credit"
                           ? "transaction-form__type-button transaction-form__type-button--active"
                           : "transaction-form__type-button"
                     }
                     onClick={() => {
                        setManualType("credit");
                        if (typeFromQuery) {
                           const next = new URLSearchParams(searchParams);
                           next.delete("type");
                           setSearchParams(next, { replace: true });
                        }
                        if (
                           !submitMutation.isSuccess &&
                           !hasSwitchedTypeBeforeSubmit &&
                           type !== "credit"
                        ) {
                           setHasSwitchedTypeBeforeSubmit(true);
                           trackKpiEvent("type_switch_before_submit", {
                              switchedToType: "credit",
                           });
                        }
                     }}
                  >
                     Income
                  </button>
               </div>

               <AmountInput
                  value={amountInput}
                  onChange={setAmountInput}
                  autoFocus
               />
            </section>

            <section className="transaction-form__section">
               <CategoryPicker
                  type={categoryType}
                  categories={categoriesQuery.data ?? []}
                  favoriteCategories={favorites}
                  selectedCategoryId={categoryId}
                  onSelect={setCategoryId}
                  isLoading={categoriesQuery.isLoading}
               />
            </section>

            <section className="transaction-form__section">
               {bankAccountNumberOptions.length > 0 ? (
                  <div className="transaction-form__field">
                     <Dropdown
                        label="Bank Account (optional)"
                        options={bankAccountNumberOptions}
                        value={selectedBankAccountNumber}
                        onChange={setSelectedBankAccountNumber}
                        placeholder="Select account"
                     />
                  </div>
               ) : null}

               <label className="transaction-form__field" htmlFor="notes-input">
                  <span>Notes (optional)</span>
                  <input
                     id="notes-input"
                     value={notes}
                     onChange={(event) => setNotes(event.target.value)}
                     placeholder="Example: team lunch"
                  />
               </label>
            </section>

            {errorMessage ? (
               <p className="transaction-form__error">{errorMessage}</p>
            ) : null}

            {retryMode ? (
               <div className="transaction-form__retry" role="alert">
                  <p>
                     Network issue detected. Form data is preserved on this
                     screen.
                  </p>
                  <button
                     type="button"
                     className="transaction-form__retry-button"
                     onClick={() => {
                        if (!submitMutation.isPending) {
                           submitCurrentForm();
                        }
                     }}
                  >
                     Retry
                  </button>
               </div>
            ) : null}

            <button
               className="transaction-form__submit"
               type="submit"
               disabled={!canSubmit}
            >
               {submitMutation.isPending ? "Saving..." : "Save transaction"}
            </button>
         </form>
      </section>
   );
}
