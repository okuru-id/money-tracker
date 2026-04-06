package service

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"time"

	"money-tracker-be/internal/model"
	"money-tracker-be/internal/repository"
)

type BankAccountService interface {
	Create(ctx context.Context, familyID string, req *model.CreateBankAccountRequest) (*model.BankAccount, error)
	GetByID(ctx context.Context, id string) (*model.BankAccount, error)
	GetByAccountNumber(ctx context.Context, familyID string, accountNumber string) (*model.BankAccount, error)
	List(ctx context.Context, familyID string) ([]model.BankAccount, error)
	Update(ctx context.Context, id string, req *model.UpdateBankAccountRequest) (*model.BankAccount, error)
	Delete(ctx context.Context, id string) error
	GetTotalBalance(ctx context.Context, familyID string) (decimal.Decimal, error)
	GetBalanceByAccountNumber(ctx context.Context, familyID, accountNumber string) (decimal.Decimal, error)
	UpdateBalance(ctx context.Context, id string, delta decimal.Decimal) error
}

type bankAccountService struct {
	bankAccountRepo repository.BankAccountRepository
}

func NewBankAccountService(bankAccountRepo repository.BankAccountRepository) BankAccountService {
	return &bankAccountService{
		bankAccountRepo: bankAccountRepo,
	}
}

func (s *bankAccountService) Create(ctx context.Context, familyID string, req *model.CreateBankAccountRequest) (*model.BankAccount, error) {
	accountNumbers := normalizeAccountNumbers(req.AccountNumbers)
	if len(accountNumbers) == 0 {
		return nil, errors.New("at least one account number is required")
	}

	if err := s.ensureAccountNumbersAvailable(ctx, familyID, accountNumbers, ""); err != nil {
		return nil, err
	}

	now := time.Now()
	account := &model.BankAccount{
		ID:              uuid.New().String(),
		FamilyID:        familyID,
		Name:            req.Name,
		AccountNumbers:  accountNumbers,
		Balance:         req.Balance,
		Icon:            req.Icon,
		Color:           req.Color,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	if err := s.bankAccountRepo.Create(ctx, account); err != nil {
		return nil, err
	}

	// Fetch the account with calculated_balance
	created, err := s.bankAccountRepo.FindByID(ctx, account.ID)
	if err != nil {
		return nil, err
	}
	if created == nil {
		return account, nil // Fallback to original if FindByID fails
	}

	return created, nil
}

func (s *bankAccountService) GetByID(ctx context.Context, id string) (*model.BankAccount, error) {
	return s.bankAccountRepo.FindByID(ctx, id)
}

func (s *bankAccountService) GetByAccountNumber(ctx context.Context, familyID string, accountNumber string) (*model.BankAccount, error) {
	return s.bankAccountRepo.FindByAccountNumber(ctx, familyID, accountNumber)
}

func (s *bankAccountService) List(ctx context.Context, familyID string) ([]model.BankAccount, error) {
	return s.bankAccountRepo.ListByFamilyID(ctx, familyID)
}

func (s *bankAccountService) Update(ctx context.Context, id string, req *model.UpdateBankAccountRequest) (*model.BankAccount, error) {
	account, err := s.bankAccountRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if account == nil {
		return nil, errors.New("bank account not found")
	}

	currentNumbers := normalizeAccountNumbers(account.AccountNumbers)
	accountNumbers := normalizeAccountNumbers(req.AccountNumbers)
	if len(accountNumbers) == 0 {
		accountNumbers = currentNumbers
	}
	if len(accountNumbers) == 0 {
		return nil, errors.New("at least one account number is required")
	}

	if err := s.ensureAccountNumbersAvailable(ctx, account.FamilyID, accountNumbers, account.ID); err != nil {
		return nil, err
	}

	if req.Name != nil {
		account.Name = *req.Name
	}
	if req.Balance != nil {
		account.Balance = *req.Balance
	}
	if req.Icon != nil {
		account.Icon = req.Icon
	}
	if req.Color != nil {
		account.Color = req.Color
	}
	account.AccountNumbers = accountNumbers
	account.UpdatedAt = time.Now()

	if err := s.bankAccountRepo.Update(ctx, account); err != nil {
		return nil, err
	}

	// Fetch the account with updated calculated_balance
	updated, err := s.bankAccountRepo.FindByID(ctx, id)
	if err != nil {
		return account, nil // Fallback to original if FindByID fails
	}
	if updated == nil {
		return account, nil
	}

	return updated, nil
}

func (s *bankAccountService) Delete(ctx context.Context, id string) error {
	account, err := s.bankAccountRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if account == nil {
		return errors.New("bank account not found")
	}

	return s.bankAccountRepo.Delete(ctx, id)
}

func (s *bankAccountService) GetTotalBalance(ctx context.Context, familyID string) (decimal.Decimal, error) {
	return s.bankAccountRepo.GetTotalBalance(ctx, familyID)
}

func (s *bankAccountService) GetBalanceByAccountNumber(ctx context.Context, familyID, accountNumber string) (decimal.Decimal, error) {
	return s.bankAccountRepo.GetBalanceByAccountNumber(ctx, familyID, accountNumber)
}

func (s *bankAccountService) UpdateBalance(ctx context.Context, id string, delta decimal.Decimal) error {
	return s.bankAccountRepo.UpdateBalance(ctx, id, delta)
}

func normalizeAccountNumbers(numbers []string) []string {
	seen := make(map[string]struct{}, len(numbers))
	normalized := make([]string, 0, len(numbers))
	for _, number := range numbers {
		trimmed := strings.TrimSpace(number)
		if trimmed == "" {
			continue
		}
		if _, ok := seen[trimmed]; ok {
			continue
		}
		seen[trimmed] = struct{}{}
		normalized = append(normalized, trimmed)
	}
	return normalized
}

func (s *bankAccountService) ensureAccountNumbersAvailable(ctx context.Context, familyID string, accountNumbers []string, excludeID string) error {
	for _, accountNumber := range accountNumbers {
		existing, err := s.bankAccountRepo.FindByAccountNumber(ctx, familyID, accountNumber)
		if err != nil {
			return err
		}
		if existing != nil && existing.ID != excludeID {
			return errors.New("account number already used")
		}
	}
	return nil
}
