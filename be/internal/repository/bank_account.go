package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shopspring/decimal"

	"money-tracker-be/internal/model"
)

type BankAccountRepository interface {
	Create(ctx context.Context, account *model.BankAccount) error
	FindByID(ctx context.Context, id string) (*model.BankAccount, error)
	FindByAccountNumber(ctx context.Context, familyID string, accountNumber string) (*model.BankAccount, error)
	ListByFamilyID(ctx context.Context, familyID string) ([]model.BankAccount, error)
	Update(ctx context.Context, account *model.BankAccount) error
	Delete(ctx context.Context, id string) error
	GetTotalBalance(ctx context.Context, familyID string) (decimal.Decimal, error)
	GetBalanceByAccountNumber(ctx context.Context, familyID, accountNumber string) (decimal.Decimal, error)
	UpdateBalance(ctx context.Context, id string, delta decimal.Decimal) error
}

type bankAccountRepository struct {
	db *pgxpool.Pool
}

type bankAccountRow interface {
	Scan(dest ...any) error
}

func NewBankAccountRepository(db *pgxpool.Pool) BankAccountRepository {
	return &bankAccountRepository{db: db}
}

func (r *bankAccountRepository) Create(ctx context.Context, account *model.BankAccount) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		}
	}()

	query := `
		INSERT INTO bank_accounts (id, family_id, name, balance, icon, color, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err = tx.Exec(ctx, query,
		account.ID,
		account.FamilyID,
		account.Name,
		account.Balance,
		account.Icon,
		account.Color,
		account.CreatedAt,
		account.UpdatedAt,
	)
	if err != nil {
		return err
	}

	if err = insertAccountNumbers(ctx, tx, account.ID, account.FamilyID, account.AccountNumbers); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *bankAccountRepository) FindByID(ctx context.Context, id string) (*model.BankAccount, error) {
	query := `
		SELECT
			ba.id, ba.family_id, ba.name,
			COALESCE(ARRAY_AGG(DISTINCT ban.account_number ORDER BY ban.account_number) FILTER (WHERE ban.account_number IS NOT NULL), '{}'::text[]) AS account_numbers,
			ba.balance, ba.icon, ba.color, ba.created_at, ba.updated_at,
			COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) -
			COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) as calculated_balance
		FROM bank_accounts ba
		LEFT JOIN bank_account_numbers ban ON ba.id = ban.bank_account_id
		LEFT JOIN transactions t ON ba.family_id = t.family_id AND ban.account_number = t.account_number AND t.account_number != ''
		WHERE ba.id = $1
		GROUP BY ba.id, ba.family_id, ba.name, ba.balance, ba.icon, ba.color, ba.created_at, ba.updated_at
	`
	return scanBankAccount(r.db.QueryRow(ctx, query, id))
}

func (r *bankAccountRepository) FindByAccountNumber(ctx context.Context, familyID string, accountNumber string) (*model.BankAccount, error) {
	query := `
		SELECT bank_account_id
		FROM bank_account_numbers
		WHERE family_id = $1 AND account_number = $2
		LIMIT 1
	`
	var bankAccountID string
	err := r.db.QueryRow(ctx, query, familyID, accountNumber).Scan(&bankAccountID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return r.FindByID(ctx, bankAccountID)
}

func (r *bankAccountRepository) ListByFamilyID(ctx context.Context, familyID string) ([]model.BankAccount, error) {
	query := `
		SELECT
			ba.id, ba.family_id, ba.name,
			COALESCE(ARRAY_AGG(DISTINCT ban.account_number ORDER BY ban.account_number) FILTER (WHERE ban.account_number IS NOT NULL), '{}'::text[]) AS account_numbers,
			ba.balance, ba.icon, ba.color, ba.created_at, ba.updated_at,
			COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) -
			COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) as calculated_balance
		FROM bank_accounts ba
		LEFT JOIN bank_account_numbers ban ON ba.id = ban.bank_account_id
		LEFT JOIN transactions t ON ba.family_id = t.family_id AND ban.account_number = t.account_number AND t.account_number != ''
		WHERE ba.family_id = $1
		GROUP BY ba.id, ba.family_id, ba.name, ba.balance, ba.icon, ba.color, ba.created_at, ba.updated_at
		ORDER BY ba.name ASC
	`
	rows, err := r.db.Query(ctx, query, familyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var accounts []model.BankAccount
	for rows.Next() {
		var account model.BankAccount
		err := rows.Scan(
			&account.ID,
			&account.FamilyID,
			&account.Name,
			&account.AccountNumbers,
			&account.Balance,
			&account.Icon,
			&account.Color,
			&account.CreatedAt,
			&account.UpdatedAt,
			&account.CalculatedBalance,
		)
		if err != nil {
			return nil, err
		}
		accounts = append(accounts, account)
	}
	return accounts, nil
}

func (r *bankAccountRepository) Update(ctx context.Context, account *model.BankAccount) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		}
	}()

	query := `
		UPDATE bank_accounts
		SET name = $1, balance = $2, icon = $3, color = $4, updated_at = $5
		WHERE id = $6
	`
	_, err = tx.Exec(ctx, query,
		account.Name,
		account.Balance,
		account.Icon,
		account.Color,
		account.UpdatedAt,
		account.ID,
	)
	if err != nil {
		return err
	}

	currentNumbers, err := getAccountNumbers(ctx, tx, account.ID)
	if err != nil {
		return err
	}
	currentSet := make(map[string]struct{}, len(currentNumbers))
	for _, number := range currentNumbers {
		currentSet[number] = struct{}{}
	}

	nextSet := make(map[string]struct{}, len(account.AccountNumbers))
	for _, number := range account.AccountNumbers {
		nextSet[number] = struct{}{}
	}

	for _, number := range currentNumbers {
		if _, ok := nextSet[number]; ok {
			continue
		}
		if _, err = tx.Exec(ctx, `
			DELETE FROM bank_account_numbers
			WHERE bank_account_id = $1 AND account_number = $2
		`, account.ID, number); err != nil {
			return err
		}
	}

	for _, number := range account.AccountNumbers {
		if _, ok := currentSet[number]; ok {
			continue
		}
		if _, err = tx.Exec(ctx, `
			INSERT INTO bank_account_numbers (bank_account_id, family_id, account_number, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5)
		`, account.ID, account.FamilyID, number, account.UpdatedAt, account.UpdatedAt); err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

func (r *bankAccountRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM bank_accounts WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *bankAccountRepository) GetTotalBalance(ctx context.Context, familyID string) (decimal.Decimal, error) {
	query := `
		SELECT COALESCE(SUM(calculated_balance), 0) FROM (
			SELECT
				COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) -
				COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) as calculated_balance
			FROM bank_accounts ba
			LEFT JOIN bank_account_numbers ban ON ba.id = ban.bank_account_id
			LEFT JOIN transactions t ON ba.family_id = t.family_id AND ban.account_number = t.account_number AND t.account_number != ''
			WHERE ba.family_id = $1
			GROUP BY ba.id
		) sub
	`
	var total decimal.Decimal
	err := r.db.QueryRow(ctx, query, familyID).Scan(&total)
	if err != nil {
		if err == pgx.ErrNoRows {
			return decimal.Zero, nil
		}
		return decimal.Zero, err
	}
	return total, nil
}

func (r *bankAccountRepository) GetBalanceByAccountNumber(ctx context.Context, familyID, accountNumber string) (decimal.Decimal, error) {
	account, err := r.FindByAccountNumber(ctx, familyID, accountNumber)
	if err != nil {
		return decimal.Zero, err
	}
	if account == nil {
		return decimal.Zero, nil
	}
	return account.CalculatedBalance, nil
}

func (r *bankAccountRepository) UpdateBalance(ctx context.Context, id string, delta decimal.Decimal) error {
	query := `UPDATE bank_accounts SET balance = balance + $1, updated_at = $2 WHERE id = $3`
	_, err := r.db.Exec(ctx, query, delta, time.Now(), id)
	return err
}

func insertAccountNumbers(ctx context.Context, executor interface{ Exec(context.Context, string, ...any) (pgconn.CommandTag, error) }, bankAccountID, familyID string, accountNumbers []string) error {
	for _, accountNumber := range accountNumbers {
		if _, err := executor.Exec(ctx, `
			INSERT INTO bank_account_numbers (bank_account_id, family_id, account_number, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5)
		`, bankAccountID, familyID, accountNumber, time.Now(), time.Now()); err != nil {
			return err
		}
	}
	return nil
}

func getAccountNumbers(ctx context.Context, executor interface{ Query(context.Context, string, ...any) (pgx.Rows, error) }, bankAccountID string) ([]string, error) {
	rows, err := executor.Query(ctx, `
		SELECT account_number
		FROM bank_account_numbers
		WHERE bank_account_id = $1
		ORDER BY created_at ASC
	`, bankAccountID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var numbers []string
	for rows.Next() {
		var number string
		if err := rows.Scan(&number); err != nil {
			return nil, err
		}
		numbers = append(numbers, number)
	}
	return numbers, rows.Err()
}

func scanBankAccount(row bankAccountRow) (*model.BankAccount, error) {
	var account model.BankAccount
	if err := row.Scan(
		&account.ID,
		&account.FamilyID,
		&account.Name,
		&account.AccountNumbers,
		&account.Balance,
		&account.Icon,
		&account.Color,
		&account.CreatedAt,
		&account.UpdatedAt,
		&account.CalculatedBalance,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &account, nil
}
