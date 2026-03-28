package service

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"

	"money-tracker-be/internal/model"
	"money-tracker-be/internal/repository"
)

type InviteService interface {
	CreateInvite(ctx context.Context, familyID, userID string) (*model.CreateInviteResponse, error)
	JoinWithToken(ctx context.Context, token, userID string) (*model.Family, error)
}

type inviteService struct {
	inviteRepo repository.InviteRepository
	familyRepo repository.FamilyRepository
	familySvc  FamilyService
}

func NewInviteService(inviteRepo repository.InviteRepository, familyRepo repository.FamilyRepository, familySvc FamilyService) InviteService {
	return &inviteService{
		inviteRepo: inviteRepo,
		familyRepo: familyRepo,
		familySvc:  familySvc,
	}
}

func (s *inviteService) CreateInvite(ctx context.Context, familyID, userID string) (*model.CreateInviteResponse, error) {
	// Check if user is owner of the family
	isOwner, err := s.familySvc.IsOwner(ctx, familyID, userID)
	if err != nil {
		return nil, err
	}
	if !isOwner {
		return nil, errors.New("only family owner can create invites")
	}

	// Generate invite token
	token := repository.GenerateInviteToken()
	expiresAt := time.Now().Add(24 * time.Hour)

	invite := &model.InviteToken{
		ID:        uuid.New().String(),
		FamilyID:  familyID,
		Token:     token,
		ExpiresAt: expiresAt,
		CreatedBy: userID,
		CreatedAt: time.Now(),
	}

	if err := s.inviteRepo.Create(ctx, invite); err != nil {
		return nil, err
	}

	return &model.CreateInviteResponse{
		Token:     token,
		ExpiresAt: expiresAt,
	}, nil
}

func (s *inviteService) JoinWithToken(ctx context.Context, token, userID string) (*model.Family, error) {
	invite, err := s.inviteRepo.FindByToken(ctx, token)
	if err != nil {
		return nil, err
	}
	if invite == nil {
		return nil, errors.New("invalid invite token")
	}

	if !invite.IsValid() {
		return nil, errors.New("invite token has expired or already used")
	}

	// Check if user is already a member
	isMember, err := s.familySvc.IsMember(ctx, invite.FamilyID, userID)
	if err != nil {
		return nil, err
	}
	if isMember {
		return nil, errors.New("already a member of this family")
	}

	// Add user as member
	if err := s.familySvc.AddMember(ctx, invite.FamilyID, userID, string(model.RoleMember)); err != nil {
		return nil, err
	}

	// Mark invite as used
	if err := s.inviteRepo.MarkUsed(ctx, invite.ID); err != nil {
		return nil, err
	}

	// Get family details
	family, err := s.familyRepo.FindByID(ctx, invite.FamilyID)
	if err != nil {
		return nil, err
	}

	return family, nil
}