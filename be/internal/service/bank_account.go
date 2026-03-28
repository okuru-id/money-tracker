package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"time"

	"money-tracker-be/internal/model"
	"money-tracker-be/internal/repository"
)

type BankAccountService interface {
	Create(ctx context.Context, familyID string, req *model.CreateBankAccountRequest) (*model.BankAccount, error)
	GetByID(ctx context.Context, id string) (*model.BankAccount, error)
	List(ctx context.Context, familyID string) ([]model.BankAccount, error)
	Update(ctx context.Context, id string, req *model.UpdateBankAccountRequest) (*model.BankAccount, error)
	Delete(ctx context.Context, id string) error
	GetTotalBalance(ctx context.Context, familyID string) (decimal.Decimal, error)
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
	now := time.Now()
	account := &model.BankAccount{
		ID:        uuid.New().String(),
		FamilyID:  familyID,
		Name:      req.Name,
		Balance:   req.Balance,
		Icon:      req.Icon,
		Color:     req.Color,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := s.bankAccountRepo.Create(ctx, account); err != nil {
		return nil, err
	}

	return account, nil
}

func (s *bankAccountService) GetByID(ctx context.Context, id string) (*model.BankAccount, error) {
	return s.bankAccountRepo.FindByID(ctx, id)
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
	account.UpdatedAt = time.Now()

	if err := s.bankAccountRepo.Update(ctx, account); err != nil {
		return nil, err
	}

	return account, nil
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

func (s *bankAccountService) UpdateBalance(ctx context.Context, id string, delta decimal.Decimal) error {
	return s.bankAccountRepo.UpdateBalance(ctx, id, delta)
}