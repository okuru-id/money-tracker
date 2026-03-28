package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shopspring/decimal"

	"money-tracker-be/internal/model"
)

type BankAccountRepository interface {
	Create(ctx context.Context, account *model.BankAccount) error
	FindByID(ctx context.Context, id string) (*model.BankAccount, error)
	ListByFamilyID(ctx context.Context, familyID string) ([]model.BankAccount, error)
	Update(ctx context.Context, account *model.BankAccount) error
	Delete(ctx context.Context, id string) error
	GetTotalBalance(ctx context.Context, familyID string) (decimal.Decimal, error)
}

type bankAccountRepository struct {
	db *pgxpool.Pool
}

func NewBankAccountRepository(db *pgxpool.Pool) BankAccountRepository {
	return &bankAccountRepository{db: db}
}

func (r *bankAccountRepository) Create(ctx context.Context, account *model.BankAccount) error {
	query := `
		INSERT INTO bank_accounts (id, family_id, name, balance, icon, color, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.Exec(ctx, query,
		account.ID,
		account.FamilyID,
		account.Name,
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
		SELECT id, family_id, name, balance, icon, color, created_at, updated_at
		FROM bank_accounts
		WHERE id = $1
	`
	var account model.BankAccount
	err := r.db.QueryRow(ctx, query, id).Scan(
		&account.ID,
		&account.FamilyID,
		&account.Name,
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
		SELECT id, family_id, name, balance, icon, color, created_at, updated_at
		FROM bank_accounts
		WHERE family_id = $1
		ORDER BY name ASC
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
			&account.Balance,
			&account.Icon,
			&account.Color,
			&account.CreatedAt,
			&account.UpdatedAt,
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
		SET name = $1, balance = $2, icon = $3, color = $4, updated_at = $5
		WHERE id = $6
	`
	_, err := r.db.Exec(ctx, query,
		account.Name,
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
	query := `SELECT COALESCE(SUM(balance), 0) FROM bank_accounts WHERE family_id = $1`
	var total decimal.Decimal
	err := r.db.QueryRow(ctx, query, familyID).Scan(&total)
	if err != nil {
		return decimal.Zero, err
	}
	return total, nil
}