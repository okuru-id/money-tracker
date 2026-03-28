package service

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"money-tracker-be/internal/model"
	"money-tracker-be/internal/repository"
)

var (
	ErrFamilyNotFound        = errors.New("family not found")
	ErrUserNotFound          = errors.New("user not found")
	ErrAlreadyMember         = errors.New("user is already a member of this family")
	ErrNotMember             = errors.New("user is not a member of this family")
	ErrCannotRemoveOwner     = errors.New("cannot remove family owner")
	ErrEmailExists           = errors.New("email already exists")
	ErrInvalidRole           = errors.New("invalid role")
	ErrUserAlreadyInFamily   = errors.New("user is already a member of another family")
	ErrUserHasTransactions   = errors.New("cannot delete user: user has transactions")
	ErrUserCreatedFamilies   = errors.New("cannot delete user: user has created families")
	ErrFamilyHasTransactions = errors.New("cannot delete family: family has transactions")
	ErrMemberHasTransactions = errors.New("cannot remove member: member has transactions in this family")
)

type AdminService interface {
	ListAllTransactions(ctx context.Context, filter TransactionFilter) (*model.TransactionListResponse, error)
	ListAllFamilies(ctx context.Context, page, limit int) (*model.FamilyListResponse, error)
	ListAllUsers(ctx context.Context, page, limit int) (*model.UserListResponse, error)
	AddMemberToFamily(ctx context.Context, req *model.AddMemberRequest) error
	RemoveMemberFromFamily(ctx context.Context, familyID, userID string) error
	CreateUser(ctx context.Context, req *model.CreateUserRequest) (*model.UserResponse, error)
	UpdateUserRole(ctx context.Context, userID string, role string) error
	DeleteUser(ctx context.Context, userID string) error
	CreateFamily(ctx context.Context, req *model.CreateFamilyRequest) (*model.FamilyListItem, error)
	UpdateFamily(ctx context.Context, familyID string, req *model.UpdateFamilyRequest) error
	DeleteFamily(ctx context.Context, familyID string) error
	GetFamilyMembers(ctx context.Context, familyID string) ([]model.FamilyMemberResponse, error)
	GetUsersWithoutFamily(ctx context.Context) ([]*model.User, error)
}

type TransactionFilter struct {
	FamilyID  string
	OwnerID   *string
	CreatedBy *string
	StartDate *string
	EndDate   *string
	Page      int
	Limit     int
}

type adminService struct {
	txRepo     repository.TransactionRepository
	familyRepo repository.FamilyRepository
	userRepo   repository.UserRepository
}

func NewAdminService(
	txRepo repository.TransactionRepository,
	familyRepo repository.FamilyRepository,
	userRepo repository.UserRepository,
) AdminService {
	return &adminService{
		txRepo:     txRepo,
		familyRepo: familyRepo,
		userRepo:   userRepo,
	}
}

func (s *adminService) ListAllTransactions(ctx context.Context, filter TransactionFilter) (*model.TransactionListResponse, error) {
	repoFilter := repository.TransactionFilter{
		FamilyID: filter.FamilyID,
		OwnerID:  filter.OwnerID,
		Page:     filter.Page,
		Limit:    filter.Limit,
	}

	return s.txRepo.ListAll(ctx, repoFilter)
}

func (s *adminService) ListAllFamilies(ctx context.Context, page, limit int) (*model.FamilyListResponse, error) {
	offset := (page - 1) * limit
	families, err := s.familyRepo.ListAll(ctx, limit, offset)
	if err != nil {
		return nil, err
	}

	total, err := s.familyRepo.Count(ctx)
	if err != nil {
		return nil, err
	}

	totalPages := int(total) / limit
	if int(total)%limit > 0 {
		totalPages++
	}

	return &model.FamilyListResponse{
		Data:       families,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (s *adminService) ListAllUsers(ctx context.Context, page, limit int) (*model.UserListResponse, error) {
	offset := (page - 1) * limit
	users, err := s.userRepo.ListAll(ctx, limit, offset)
	if err != nil {
		return nil, err
	}

	total, err := s.userRepo.Count(ctx)
	if err != nil {
		return nil, err
	}

	totalPages := int(total) / limit
	if int(total)%limit > 0 {
		totalPages++
	}

	return &model.UserListResponse{
		Data:       users,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (s *adminService) AddMemberToFamily(ctx context.Context, req *model.AddMemberRequest) error {
	// Check if family exists
	family, err := s.familyRepo.FindByID(ctx, req.FamilyID)
	if err != nil {
		return err
	}
	if family == nil {
		return ErrFamilyNotFound
	}

	// Check if user exists
	user, err := s.userRepo.FindByID(ctx, req.UserID)
	if err != nil {
		return err
	}
	if user == nil {
		return ErrUserNotFound
	}

	// Check if already a member of this family
	existing, err := s.familyRepo.FindMemberByUserID(ctx, req.FamilyID, req.UserID)
	if err != nil {
		return err
	}
	if existing != nil {
		return ErrAlreadyMember
	}

	// Check if user is already a member of another family (one user = one family)
	families, err := s.familyRepo.FindFamiliesByUserID(ctx, req.UserID)
	if err != nil {
		return err
	}
	if len(families) > 0 {
		return ErrUserAlreadyInFamily
	}

	// Add member
	return s.familyRepo.AddMember(ctx, req.ToFamilyMember())
}

func (s *adminService) RemoveMemberFromFamily(ctx context.Context, familyID, userID string) error {
	// Check if member exists
	member, err := s.familyRepo.FindMemberByUserID(ctx, familyID, userID)
	if err != nil {
		return err
	}
	if member == nil {
		return ErrNotMember
	}

	// Check if member has transactions in this family
	txCount, err := s.txRepo.CountByOwnerInFamily(ctx, familyID, userID)
	if err != nil {
		return err
	}
	if txCount > 0 {
		return ErrMemberHasTransactions
	}

	// If removing owner, transfer ownership to another member first
	if member.Role == string(model.RoleOwner) {
		// Get all other members
		members, err := s.familyRepo.FindMembers(ctx, familyID)
		if err != nil {
			return err
		}

		// Find another member to transfer ownership
		for _, m := range members {
			if m.UserID != userID {
				// Transfer ownership
				err := s.familyRepo.TransferOwnership(ctx, familyID, m.UserID)
				if err != nil {
					return err
				}
				break
			}
		}
	}

	return s.familyRepo.RemoveMember(ctx, familyID, userID)
}

func (s *adminService) CreateUser(ctx context.Context, req *model.CreateUserRequest) (*model.UserResponse, error) {
	// Check if email already exists
	existing, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, ErrEmailExists
	}

	// Validate role
	if req.Role != "user" && req.Role != "admin" {
		return nil, ErrInvalidRole
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Create user
	now := time.Now()
	user := &model.User{
		ID:           uuid.NewString(),
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Role:         model.UserRole(req.Role),
		CreatedAt:    now,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return &model.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Role:      string(user.Role),
		CreatedAt: user.CreatedAt,
	}, nil
}

func (s *adminService) UpdateUserRole(ctx context.Context, userID string, role string) error {
	// Validate role
	if role != "user" && role != "admin" {
		return ErrInvalidRole
	}

	// Check if user exists
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return err
	}
	if user == nil {
		return ErrUserNotFound
	}

	return s.userRepo.UpdateRole(ctx, userID, role)
}

func (s *adminService) DeleteUser(ctx context.Context, userID string) error {
	// Check if user exists
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return err
	}
	if user == nil {
		return ErrUserNotFound
	}

	// Check if user has transactions
	txCount, err := s.txRepo.CountByUserID(ctx, userID)
	if err != nil {
		return err
	}
	if txCount > 0 {
		return ErrUserHasTransactions
	}

	// Check if user has created families
	familyCount, err := s.familyRepo.CountByCreator(ctx, userID)
	if err != nil {
		return err
	}
	if familyCount > 0 {
		return ErrUserCreatedFamilies
	}

	return s.userRepo.Delete(ctx, userID)
}

func (s *adminService) CreateFamily(ctx context.Context, req *model.CreateFamilyRequest) (*model.FamilyListItem, error) {
	now := time.Now()
	family := &model.Family{
		ID:        uuid.NewString(),
		Name:      req.Name,
		CreatedBy: req.CreatedBy,
		CreatedAt: now,
	}

	if err := s.familyRepo.Create(ctx, family); err != nil {
		return nil, err
	}

	// Get creator name
	creator, _ := s.userRepo.FindByID(ctx, req.CreatedBy)
	creatorName := ""
	if creator != nil {
		creatorName = creator.Email
	}

	return &model.FamilyListItem{
		ID:            family.ID,
		Name:          family.Name,
		CreatedBy:     family.CreatedBy,
		CreatedByName: creatorName,
		CreatedAt:     family.CreatedAt,
	}, nil
}

func (s *adminService) UpdateFamily(ctx context.Context, familyID string, req *model.UpdateFamilyRequest) error {
	// Check if family exists
	family, err := s.familyRepo.FindByID(ctx, familyID)
	if err != nil {
		return err
	}
	if family == nil {
		return ErrFamilyNotFound
	}

	return s.familyRepo.Update(ctx, familyID, req.Name)
}

func (s *adminService) DeleteFamily(ctx context.Context, familyID string) error {
	// Check if family exists
	family, err := s.familyRepo.FindByID(ctx, familyID)
	if err != nil {
		return err
	}
	if family == nil {
		return ErrFamilyNotFound
	}

	// Check if family has transactions
	txCount, err := s.txRepo.CountByFamilyID(ctx, familyID)
	if err != nil {
		return err
	}
	if txCount > 0 {
		return ErrFamilyHasTransactions
	}

	return s.familyRepo.Delete(ctx, familyID)
}

func (s *adminService) GetFamilyMembers(ctx context.Context, familyID string) ([]model.FamilyMemberResponse, error) {
	return s.familyRepo.FindMembers(ctx, familyID)
}

func (s *adminService) GetUsersWithoutFamily(ctx context.Context) ([]*model.User, error) {
	return s.userRepo.FindUsersWithoutFamily(ctx)
}