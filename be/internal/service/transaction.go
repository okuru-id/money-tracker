package service

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"money-tracker-be/internal/model"
	"money-tracker-be/internal/repository"
)

type TransactionService interface {
	Create(ctx context.Context, familyID, userID string, req *model.CreateTransactionRequest) (*model.Transaction, error)
	GetByID(ctx context.Context, id string) (*model.Transaction, error)
	List(ctx context.Context, filter repository.TransactionFilter) (*model.TransactionListResponse, error)
	Update(ctx context.Context, userID string, userRole string, transactionID string, req *model.UpdateTransactionRequest) (*model.Transaction, error)
	Delete(ctx context.Context, userID string, userRole string, transactionID string) error
	GetPersonalSummary(ctx context.Context, familyID string) (*model.PersonalSummaryResponse, error)
	GetInsights(ctx context.Context, familyID string) (*model.InsightsResponse, error)
}

type transactionService struct {
	transactionRepo   repository.TransactionRepository
	bankAccountRepo   repository.BankAccountRepository
	familyRepo        repository.FamilyRepository
}

func NewTransactionService(transactionRepo repository.TransactionRepository, bankAccountRepo repository.BankAccountRepository, familyRepo repository.FamilyRepository) TransactionService {
	return &transactionService{
		transactionRepo:   transactionRepo,
		bankAccountRepo:   bankAccountRepo,
		familyRepo:        familyRepo,
	}
}

func (s *transactionService) Create(ctx context.Context, familyID, userID string, req *model.CreateTransactionRequest) (*model.Transaction, error) {
	// Determine wallet owner
	walletOwnerID := userID
	if req.WalletOwnerID != nil && *req.WalletOwnerID != "" {
		walletOwnerID = *req.WalletOwnerID
	}

	// Parse transaction date
	transactionDate, err := time.Parse("2006-01-02", req.TransactionDate)
	if err != nil {
		return nil, errors.New("invalid transaction date format, use YYYY-MM-DD")
	}

	tx := &model.Transaction{
		ID:              uuid.New().String(),
		FamilyID:        familyID,
		WalletOwnerID:   walletOwnerID,
		AccountNumber:   req.AccountNumber,
		Type:            model.TransactionType(req.Type),
		Amount:          req.Amount,
		CategoryID:      req.CategoryID,
		Note:            req.Note,
		TransactionDate: transactionDate,
		CreatedBy:       userID,
		CreatedAt:       time.Now(),
	}

	if err := s.transactionRepo.Create(ctx, tx); err != nil {
		return nil, err
	}

	// Update bank account balance if account_number is provided and matches a bank account
	if req.AccountNumber != nil && *req.AccountNumber != "" {
		bankAccount, err := s.bankAccountRepo.FindByAccountNumber(ctx, familyID, *req.AccountNumber)
		if err == nil && bankAccount != nil {
			// Determine delta: positive for income/credit, negative for expense/debit
			var delta decimal.Decimal
			if tx.Type == model.TransactionCredit {
				delta = tx.Amount
			} else {
				delta = tx.Amount.Neg()
			}

			if err := s.bankAccountRepo.UpdateBalance(ctx, bankAccount.ID, delta); err != nil {
				// Log the error but don't fail the transaction
				// Balance can be manually corrected later
			}
		}
	}

	return tx, nil
}

func (s *transactionService) GetByID(ctx context.Context, id string) (*model.Transaction, error) {
	return s.transactionRepo.FindByID(ctx, id)
}

func (s *transactionService) List(ctx context.Context, filter repository.TransactionFilter) (*model.TransactionListResponse, error) {
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Limit <= 0 {
		filter.Limit = 20
	}
	if filter.Limit > 100 {
		filter.Limit = 100
	}

	return s.transactionRepo.List(ctx, filter)
}

func (s *transactionService) Update(ctx context.Context, userID string, userRole string, transactionID string, req *model.UpdateTransactionRequest) (*model.Transaction, error) {
	tx, err := s.transactionRepo.FindByID(ctx, transactionID)
	if err != nil {
		return nil, err
	}
	if tx == nil {
		return nil, errors.New("transaction not found")
	}

	// Check if user can modify this transaction
	// User can modify if:
	// 1. They are an admin (system role)
	// 2. They are the creator (and not legacy)
	// 3. They are the owner of the family
	canModify := userRole == string(model.RoleAdmin)
	if !canModify {
		canModify = tx.CanModify(userID)
		if !canModify {
			// Check if user is owner of the family
			member, err := s.familyRepo.FindMemberByUserID(ctx, tx.FamilyID, userID)
			if err == nil && member != nil && member.Role == string(model.RoleOwner) {
				canModify = true
			}
		}
	}
	if !canModify {
		return nil, errors.New("not authorized to modify this transaction")
	}

	// Apply updates
	if req.WalletOwnerID != nil {
		tx.WalletOwnerID = *req.WalletOwnerID
	}
	if req.Type != nil {
		tx.Type = model.TransactionType(*req.Type)
	}
	if req.Amount != nil {
		tx.Amount = *req.Amount
	}
	if req.CategoryID != nil {
		tx.CategoryID = req.CategoryID
	}
	if req.Note != nil {
		tx.Note = req.Note
	}
	if req.TransactionDate != nil {
		transactionDate, err := time.Parse("2006-01-02", *req.TransactionDate)
		if err != nil {
			return nil, errors.New("invalid transaction date format, use YYYY-MM-DD")
		}
		tx.TransactionDate = transactionDate
	}

	if err := s.transactionRepo.Update(ctx, tx); err != nil {
		return nil, err
	}

	// Update bank account balance if account_number is set
	if tx.AccountNumber != nil && *tx.AccountNumber != "" {
		newBalance, calcErr := s.bankAccountRepo.GetBalanceByAccountNumber(ctx, tx.FamilyID, *tx.AccountNumber)
		if calcErr == nil {
			bankAccount, err := s.bankAccountRepo.FindByAccountNumber(ctx, tx.FamilyID, *tx.AccountNumber)
			if err == nil && bankAccount != nil {
				// Calculate delta from current balance
				delta := newBalance.Sub(bankAccount.Balance)
				if !delta.IsZero() {
					s.bankAccountRepo.UpdateBalance(ctx, bankAccount.ID, delta)
				}
			}
		}
	}

	return tx, nil
}

func (s *transactionService) Delete(ctx context.Context, userID string, userRole string, transactionID string) error {
	tx, err := s.transactionRepo.FindByID(ctx, transactionID)
	if err != nil {
		return err
	}
	if tx == nil {
		return errors.New("transaction not found")
	}

	// Check if user can modify this transaction
	// User can modify if:
	// 1. They are an admin (system role)
	// 2. They are the creator (and not legacy)
	// 3. They are the owner of the family
	canModify := userRole == string(model.RoleAdmin)
	if !canModify {
		canModify = tx.CanModify(userID)
		if !canModify {
			// Check if user is owner of the family
			member, err := s.familyRepo.FindMemberByUserID(ctx, tx.FamilyID, userID)
			if err == nil && member != nil && member.Role == string(model.RoleOwner) {
				canModify = true
			}
		}
	}
	if !canModify {
		return errors.New("not authorized to delete this transaction")
	}

	// Get account_number before delete to update balance
	var accountNumber *string
	if tx.AccountNumber != nil {
		accountNumber = tx.AccountNumber
	}

	if err := s.transactionRepo.Delete(ctx, transactionID); err != nil {
		return err
	}

	// Update bank account balance if account_number is set
	if accountNumber != nil && *accountNumber != "" {
		newBalance, calcErr := s.bankAccountRepo.GetBalanceByAccountNumber(ctx, tx.FamilyID, *accountNumber)
		if calcErr == nil {
			bankAccount, err := s.bankAccountRepo.FindByAccountNumber(ctx, tx.FamilyID, *accountNumber)
			if err == nil && bankAccount != nil {
				// Calculate delta from current balance
				delta := newBalance.Sub(bankAccount.Balance)
				if !delta.IsZero() {
					s.bankAccountRepo.UpdateBalance(ctx, bankAccount.ID, delta)
				}
			}
		}
	}

	return nil
}

func (s *transactionService) GetPersonalSummary(ctx context.Context, familyID string) (*model.PersonalSummaryResponse, error) {
	return s.transactionRepo.GetPersonalSummary(ctx, familyID)
}

func (s *transactionService) GetInsights(ctx context.Context, familyID string) (*model.InsightsResponse, error) {
	return s.transactionRepo.GetInsights(ctx, familyID)
}

// Helper for decimal
var _ = decimal.Decimal{}