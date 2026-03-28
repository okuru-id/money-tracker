package service

import (
	"context"
	"time"

	"github.com/google/uuid"

	"money-tracker-be/internal/model"
	"money-tracker-be/internal/repository"
)

type FamilyService interface {
	Create(ctx context.Context, userID string, req *model.CreateFamilyRequest) (*model.Family, error)
	GetSummary(ctx context.Context, familyID string, period string) (*model.FamilySummaryResponse, error)
	GetMembers(ctx context.Context, familyID string) ([]model.FamilyMemberResponse, error)
	AddMember(ctx context.Context, familyID, userID, role string) error
	RemoveMember(ctx context.Context, familyID, userID string) error
	IsMember(ctx context.Context, familyID, userID string) (bool, error)
	IsOwner(ctx context.Context, familyID, userID string) (bool, error)
}

type familyService struct {
	familyRepo    repository.FamilyRepository
	transactionRepo repository.TransactionRepository
}

func NewFamilyService(familyRepo repository.FamilyRepository, transactionRepo repository.TransactionRepository) FamilyService {
	return &familyService{
		familyRepo:     familyRepo,
		transactionRepo: transactionRepo,
	}
}

func (s *familyService) Create(ctx context.Context, userID string, req *model.CreateFamilyRequest) (*model.Family, error) {
	family := &model.Family{
		ID:        uuid.New().String(),
		Name:      req.Name,
		CreatedBy: userID,
		CreatedAt: time.Now(),
	}

	if err := s.familyRepo.Create(ctx, family); err != nil {
		return nil, err
	}

	// Add creator as owner
	member := &model.FamilyMember{
		ID:       uuid.New().String(),
		FamilyID: family.ID,
		UserID:   userID,
		Role:     string(model.RoleOwner),
		JoinedAt: time.Now(),
	}

	if err := s.familyRepo.AddMember(ctx, member); err != nil {
		return nil, err
	}

	return family, nil
}

func (s *familyService) GetSummary(ctx context.Context, familyID string, period string) (*model.FamilySummaryResponse, error) {
	return s.transactionRepo.GetSummary(ctx, familyID, period)
}

func (s *familyService) GetMembers(ctx context.Context, familyID string) ([]model.FamilyMemberResponse, error) {
	return s.familyRepo.FindMembers(ctx, familyID)
}

func (s *familyService) AddMember(ctx context.Context, familyID, userID, role string) error {
	member := &model.FamilyMember{
		ID:       uuid.New().String(),
		FamilyID: familyID,
		UserID:   userID,
		Role:     role,
		JoinedAt: time.Now(),
	}
	return s.familyRepo.AddMember(ctx, member)
}

func (s *familyService) IsMember(ctx context.Context, familyID, userID string) (bool, error) {
	member, err := s.familyRepo.FindMemberByUserID(ctx, familyID, userID)
	if err != nil {
		return false, err
	}
	return member != nil, nil
}

func (s *familyService) IsOwner(ctx context.Context, familyID, userID string) (bool, error) {
	return s.familyRepo.IsOwner(ctx, familyID, userID)
}

func (s *familyService) RemoveMember(ctx context.Context, familyID, userID string) error {
	return s.familyRepo.RemoveMember(ctx, familyID, userID)
}