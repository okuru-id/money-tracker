package repository

import (
	"context"
	"time"

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

func NewBankAccountRepository(db *pgxpool.Pool) BankAccountRepository {
	return &bankAccountRepository{db: db}
}

func (r *bankAccountRepository) Create(ctx context.Context, account *model.BankAccount) error {
	query := `
		INSERT INTO bank_accounts (id, family_id, name, account_number, balance, icon, color, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.Exec(ctx, query,
		account.ID,
		account.FamilyID,
		account.Name,
		account.AccountNumber,
		account.Balance,
		account.Icon,
		account.Color,
		account.CreatedAt,
		account.UpdatedAt,
	)
	return err
}

func (r *bankAccountRepository) FindByID(ctx context.Context, id string) (*model.BankAccount, error) {
	query := `
		SELECT
			ba.id, ba.family_id, ba.name, ba.account_number, ba.balance, ba.icon, ba.color, ba.created_at, ba.updated_at,
			COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) -
			COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) as calculated_balance
		FROM bank_accounts ba
		LEFT JOIN transactions t ON ba.family_id = t.family_id AND ba.account_number = t.account_number AND t.account_number != ''
		WHERE ba.id = $1
		GROUP BY ba.id, ba.family_id, ba.name, ba.account_number, ba.balance, ba.icon, ba.color, ba.created_at, ba.updated_at
	`
	var account model.BankAccount
	err := r.db.QueryRow(ctx, query, id).Scan(
		&account.ID,
		&account.FamilyID,
		&account.Name,
		&account.AccountNumber,
		&account.Balance,
		&account.Icon,
		&account.Color,
		&account.CreatedAt,
		&account.UpdatedAt,
		&account.CalculatedBalance,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &account, nil
}

func (r *bankAccountRepository) FindByAccountNumber(ctx context.Context, familyID string, accountNumber string) (*model.BankAccount, error) {
	query := `
		SELECT id, family_id, name, account_number, balance, icon, color, created_at, updated_at
		FROM bank_accounts
		WHERE family_id = $1 AND account_number = $2
	`
	var account model.BankAccount
	err := r.db.QueryRow(ctx, query, familyID, accountNumber).Scan(
		&account.ID,
		&account.FamilyID,
		&account.Name,
		&account.AccountNumber,
		&account.Balance,
		&account.Icon,
		&account.Color,
		&account.CreatedAt,
		&account.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &account, nil
}

func (r *bankAccountRepository) ListByFamilyID(ctx context.Context, familyID string) ([]model.BankAccount, error) {
	query := `
		SELECT
			ba.id, ba.family_id, ba.name, ba.account_number, ba.balance, ba.icon, ba.color, ba.created_at, ba.updated_at,
			COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) -
			COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) as calculated_balance
		FROM bank_accounts ba
		LEFT JOIN transactions t ON ba.family_id = t.family_id AND ba.account_number = t.account_number AND t.account_number != ''
		WHERE ba.family_id = $1
		GROUP BY ba.id, ba.family_id, ba.name, ba.account_number, ba.balance, ba.icon, ba.color, ba.created_at, ba.updated_at
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
			&account.AccountNumber,
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
	query := `
		UPDATE bank_accounts
		SET name = $1, account_number = $2, balance = $3, icon = $4, color = $5, updated_at = $6
		WHERE id = $7
	`
	_, err := r.db.Exec(ctx, query,
		account.Name,
		account.AccountNumber,
		account.Balance,
		account.Icon,
		account.Color,
		account.UpdatedAt,
		account.ID,
	)
	return err
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
			LEFT JOIN transactions t ON ba.family_id = t.family_id AND ba.account_number = t.account_number AND t.account_number != ''
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
	query := `
		SELECT COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) -
		       COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0)
		FROM transactions
		WHERE family_id = $1 AND account_number = $2
	`
	var balance decimal.Decimal
	err := r.db.QueryRow(ctx, query, familyID, accountNumber).Scan(&balance)
	if err != nil {
		if err == pgx.ErrNoRows {
			return decimal.Zero, nil
		}
		return decimal.Zero, err
	}
	return balance, nil
}

func (r *bankAccountRepository) UpdateBalance(ctx context.Context, id string, delta decimal.Decimal) error {
	query := `UPDATE bank_accounts SET balance = balance + $1, updated_at = $2 WHERE id = $3`
	_, err := r.db.Exec(ctx, query, delta, time.Now(), id)
	return err
}