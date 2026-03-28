package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shopspring/decimal"

	"money-tracker-be/internal/model"
)

type TransactionRepository interface {
	Create(ctx context.Context, tx *model.Transaction) error
	FindByID(ctx context.Context, id string) (*model.Transaction, error)
	List(ctx context.Context, filter TransactionFilter) (*model.TransactionListResponse, error)
	Update(ctx context.Context, tx *model.Transaction) error
	Delete(ctx context.Context, id string) error
	GetSummary(ctx context.Context, familyID string, period string) (*model.FamilySummaryResponse, error)
	GetPersonalSummary(ctx context.Context, familyID string) (*model.PersonalSummaryResponse, error)
	ListAll(ctx context.Context, filter TransactionFilter) (*model.TransactionListResponse, error)
	Count(ctx context.Context) (int64, error)
	CountByUserID(ctx context.Context, userID string) (int64, error)
	CountByFamilyID(ctx context.Context, familyID string) (int64, error)
	CountByOwnerInFamily(ctx context.Context, familyID, ownerID string) (int64, error)
}

type TransactionFilter struct {
	FamilyID  string
	OwnerID   *string
	CreatedBy *string
	StartDate *time.Time
	EndDate   *time.Time
	Page      int
	Limit     int
}

type transactionRepository struct {
	db *pgxpool.Pool
}

func NewTransactionRepository(db *pgxpool.Pool) TransactionRepository {
	return &transactionRepository{db: db}
}

func (r *transactionRepository) Create(ctx context.Context, tx *model.Transaction) error {
	query := `
		INSERT INTO transactions (
			id, family_id, wallet_owner_id, type, amount, category_id, note,
			transaction_date, created_by, created_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.Exec(ctx, query,
		tx.ID,
		tx.FamilyID,
		tx.WalletOwnerID,
		tx.Type,
		tx.Amount,
		tx.CategoryID,
		tx.Note,
		tx.TransactionDate,
		tx.CreatedBy,
		tx.CreatedAt,
	)
	return err
}

func (r *transactionRepository) FindByID(ctx context.Context, id string) (*model.Transaction, error) {
	query := `
		SELECT id, family_id, wallet_owner_id, type, amount, category_id, note,
			   transaction_date, created_by, created_at, updated_at,
			   message_id, bank_name, account_number, balance, raw_email
		FROM transactions
		WHERE id = $1
	`
	tx := &model.Transaction{}
	var messageID, bankName, accountNumber, rawEmail *string
	var balance *decimal.Decimal

	err := r.db.QueryRow(ctx, query, id).Scan(
		&tx.ID,
		&tx.FamilyID,
		&tx.WalletOwnerID,
		&tx.Type,
		&tx.Amount,
		&tx.CategoryID,
		&tx.Note,
		&tx.TransactionDate,
		&tx.CreatedBy,
		&tx.CreatedAt,
		&tx.UpdatedAt,
		&messageID,
		&bankName,
		&accountNumber,
		&balance,
		&rawEmail,
	)
	tx.MessageID = messageID
	tx.BankName = bankName
	tx.AccountNumber = accountNumber
	tx.Balance = balance
	tx.RawEmail = rawEmail

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return tx, nil
}

func (r *transactionRepository) List(ctx context.Context, filter TransactionFilter) (*model.TransactionListResponse, error) {
	// Build query with filters
	baseQuery := `
		FROM transactions t
		LEFT JOIN categories c ON t.category_id = c.id
		WHERE t.family_id = $1
	`
	args := []interface{}{filter.FamilyID}
	argIdx := 2

	if filter.OwnerID != nil {
		baseQuery += " AND t.wallet_owner_id = $" + string(rune('0'+argIdx))
		args = append(args, *filter.OwnerID)
		argIdx++
	}

	if filter.StartDate != nil {
		baseQuery += " AND t.transaction_date >= $" + string(rune('0'+argIdx))
		args = append(args, *filter.StartDate)
		argIdx++
	}

	if filter.EndDate != nil {
		baseQuery += " AND t.transaction_date <= $" + string(rune('0'+argIdx))
		args = append(args, *filter.EndDate)
		argIdx++
	}

	// Count total
	countQuery := "SELECT COUNT(*) " + baseQuery
	var total int64
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	// Get paginated results
	offset := (filter.Page - 1) * filter.Limit
	dataQuery := `
		SELECT t.id, t.family_id, t.wallet_owner_id, t.type, t.amount, t.category_id,
			   COALESCE(c.name, '') as category_name,
			   t.note, t.transaction_date, t.created_by, t.created_at, t.updated_at
		` + baseQuery + `
		ORDER BY t.transaction_date DESC, t.created_at DESC
		LIMIT $` + string(rune('0'+argIdx)) + ` OFFSET $` + string(rune('0'+argIdx+1))
	args = append(args, filter.Limit, offset)

	rows, err := r.db.Query(ctx, dataQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []model.TransactionResponse
	for rows.Next() {
		var tx model.TransactionResponse
		var categoryName string
		err := rows.Scan(
			&tx.ID,
			&tx.FamilyID,
			&tx.WalletOwnerID,
			&tx.Type,
			&tx.Amount,
			&tx.CategoryID,
			&categoryName,
			&tx.Note,
			&tx.TransactionDate,
			&tx.CreatedBy,
			&tx.CreatedAt,
			&tx.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		tx.CategoryName = categoryName
		transactions = append(transactions, tx)
	}

	totalPages := int(total) / filter.Limit
	if int(total)%filter.Limit > 0 {
		totalPages++
	}

	return &model.TransactionListResponse{
		Data:       transactions,
		Total:      total,
		Page:       filter.Page,
		Limit:      filter.Limit,
		TotalPages: totalPages,
	}, nil
}

func (r *transactionRepository) Update(ctx context.Context, tx *model.Transaction) error {
	query := `
		UPDATE transactions
		SET wallet_owner_id = $2, type = $3, amount = $4, category_id = $5,
			note = $6, transaction_date = $7, updated_at = $8
		WHERE id = $1
	`
	now := time.Now()
	_, err := r.db.Exec(ctx, query,
		tx.ID,
		tx.WalletOwnerID,
		tx.Type,
		tx.Amount,
		tx.CategoryID,
		tx.Note,
		tx.TransactionDate,
		&now,
	)
	if err != nil {
		return err
	}
	tx.UpdatedAt = &now
	return nil
}

func (r *transactionRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM transactions WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *transactionRepository) GetSummary(ctx context.Context, familyID string, period string) (*model.FamilySummaryResponse, error) {
	var startDate, endDate time.Time
	now := time.Now()

	switch period {
	case "today":
		startDate = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		endDate = startDate.Add(24 * time.Hour)
	case "week":
		weekday := int(now.Weekday())
		startDate = time.Date(now.Year(), now.Month(), now.Day()-weekday, 0, 0, 0, 0, now.Location())
		endDate = startDate.Add(7 * 24 * time.Hour)
	case "month":
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		endDate = startDate.AddDate(0, 1, 0)
	default:
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		endDate = startDate.AddDate(0, 1, 0)
	}

	query := `
		SELECT
			COALESCE(SUM(CASE WHEN type IN ('income', 'credit') THEN amount ELSE 0 END), 0) as total_income,
			COALESCE(SUM(CASE WHEN type IN ('expense', 'debit') THEN amount ELSE 0 END), 0) as total_expense
		FROM transactions
		WHERE family_id = $1 AND transaction_date >= $2 AND transaction_date < $3
	`

	var totalIncome, totalExpense decimal.Decimal
	err := r.db.QueryRow(ctx, query, familyID, startDate, endDate).Scan(&totalIncome, &totalExpense)
	if err != nil && err != pgx.ErrNoRows {
		return nil, err
	}

	return &model.FamilySummaryResponse{
		TotalIncome:  totalIncome,
		TotalExpense: totalExpense,
		NetBalance:   totalIncome.Sub(totalExpense),
		Period:       period,
	}, nil
}

func (r *transactionRepository) GetPersonalSummary(ctx context.Context, familyID string) (*model.PersonalSummaryResponse, error) {
	query := `
		SELECT
			COALESCE(SUM(CASE WHEN type IN ('income', 'credit') THEN amount ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN type IN ('expense', 'debit') THEN amount ELSE 0 END), 0)
		FROM transactions
		WHERE family_id = $1
	`

	var totalIncome, totalExpense decimal.Decimal
	err := r.db.QueryRow(ctx, query, familyID).Scan(&totalIncome, &totalExpense)
	if err != nil && err != pgx.ErrNoRows {
		return nil, err
	}

	return &model.PersonalSummaryResponse{
		TotalIncome:  totalIncome,
		TotalExpense: totalExpense,
		NetBalance:   totalIncome.Sub(totalExpense),
	}, nil
}

// ListAll returns all transactions across families (for admin)
func (r *transactionRepository) ListAll(ctx context.Context, filter TransactionFilter) (*model.TransactionListResponse, error) {
	// Build query with optional family_id filter
	baseQuery := `
		FROM transactions t
		LEFT JOIN categories c ON t.category_id = c.id
		LEFT JOIN users u1 ON t.created_by = u1.id
		LEFT JOIN users u2 ON t.wallet_owner_id = u2.id
		WHERE 1=1
	`
	args := []interface{}{}
	argIdx := 1

	if filter.FamilyID != "" {
		baseQuery += " AND t.family_id = $" + string(rune('0'+argIdx))
		args = append(args, filter.FamilyID)
		argIdx++
	}

	if filter.OwnerID != nil {
		baseQuery += " AND t.wallet_owner_id = $" + string(rune('0'+argIdx))
		args = append(args, *filter.OwnerID)
		argIdx++
	}

		if filter.CreatedBy != nil {
			baseQuery += " AND t.created_by = $" + string(rune('0'+argIdx))
			args = append(args, *filter.CreatedBy)
			argIdx++
		}

	if filter.StartDate != nil {
		baseQuery += " AND t.transaction_date >= $" + string(rune('0'+argIdx))
		args = append(args, *filter.StartDate)
		argIdx++
	}

	if filter.EndDate != nil {
		baseQuery += " AND t.transaction_date <= $" + string(rune('0'+argIdx))
		args = append(args, *filter.EndDate)
		argIdx++
	}

	// Count total
	countQuery := "SELECT COUNT(*) " + baseQuery
	var total int64
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	// Get paginated results
	offset := (filter.Page - 1) * filter.Limit
	dataQuery := `
		SELECT t.id, t.family_id, t.wallet_owner_id, t.type, t.amount, t.category_id,
			   COALESCE(c.name, '') as category_name,
			   t.note, t.transaction_date, t.created_by, t.created_at, t.updated_at,
			   COALESCE(u1.email, '') as created_by_name,
			   COALESCE(u2.email, '') as wallet_owner_name
		` + baseQuery + `
		ORDER BY t.transaction_date DESC, t.created_at DESC
		LIMIT $` + string(rune('0'+argIdx)) + ` OFFSET $` + string(rune('0'+argIdx+1))
	args = append(args, filter.Limit, offset)

	rows, err := r.db.Query(ctx, dataQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []model.TransactionResponse
	for rows.Next() {
		var tx model.TransactionResponse
		var categoryName, createdByName, walletOwnerName string
		err := rows.Scan(
			&tx.ID,
			&tx.FamilyID,
			&tx.WalletOwnerID,
			&tx.Type,
			&tx.Amount,
			&tx.CategoryID,
			&categoryName,
			&tx.Note,
			&tx.TransactionDate,
			&tx.CreatedBy,
			&tx.CreatedAt,
			&tx.UpdatedAt,
			&createdByName,
			&walletOwnerName,
		)
		if err != nil {
			return nil, err
		}
		tx.CategoryName = categoryName
		tx.CreatedByName = createdByName
		tx.WalletOwnerName = walletOwnerName
		transactions = append(transactions, tx)
	}

	totalPages := int(total) / filter.Limit
	if int(total)%filter.Limit > 0 {
		totalPages++
	}

	return &model.TransactionListResponse{
		Data:       transactions,
		Total:      total,
		Page:       filter.Page,
		Limit:      filter.Limit,
		TotalPages: totalPages,
	}, nil
}

func (r *transactionRepository) Count(ctx context.Context) (int64, error) {
	query := `SELECT COUNT(*) FROM transactions`
	var count int64
	err := r.db.QueryRow(ctx, query).Scan(&count)
	return count, err
}

func (r *transactionRepository) CountByUserID(ctx context.Context, userID string) (int64, error) {
	query := `SELECT COUNT(*) FROM transactions WHERE created_by = $1`
	var count int64
	err := r.db.QueryRow(ctx, query, userID).Scan(&count)
	return count, err
}

func (r *transactionRepository) CountByFamilyID(ctx context.Context, familyID string) (int64, error) {
	query := `SELECT COUNT(*) FROM transactions WHERE family_id = $1`
	var count int64
	err := r.db.QueryRow(ctx, query, familyID).Scan(&count)
	return count, err
}

func (r *transactionRepository) CountByOwnerInFamily(ctx context.Context, familyID, ownerID string) (int64, error) {
	query := `SELECT COUNT(*) FROM transactions WHERE family_id = $1 AND wallet_owner_id = $2`
	var count int64
	err := r.db.QueryRow(ctx, query, familyID, ownerID).Scan(&count)
	return count, err
}