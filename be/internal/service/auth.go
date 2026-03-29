package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"money-tracker-be/internal/config"
	"money-tracker-be/internal/model"
	"money-tracker-be/internal/repository"
)

type AuthService interface {
	Register(ctx context.Context, req *model.RegisterRequest) (*model.User, error)
	Login(ctx context.Context, req *model.LoginRequest) (string, *model.User, error)
	Logout(ctx context.Context, sessionID string) error
	ValidateSession(ctx context.Context, sessionID string) (*model.SessionData, error)
	UpdateSessionFamily(ctx context.Context, sessionID, familyID string) error
}

type authService struct {
	userRepo    repository.UserRepository
	familyRepo  repository.FamilyRepository
	sessionRepo repository.SessionRepository
	config      *config.Config
}

func NewAuthService(userRepo repository.UserRepository, familyRepo repository.FamilyRepository, sessionRepo repository.SessionRepository, cfg *config.Config) AuthService {
	return &authService{
		userRepo:    userRepo,
		familyRepo:  familyRepo,
		sessionRepo: sessionRepo,
		config:      cfg,
	}
}

func (s *authService) Register(ctx context.Context, req *model.RegisterRequest) (*model.User, error) {
	// Check if email already exists
	existingUser, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("email already registered")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		ID:           uuid.New().String(),
		Email:        req.Email,
		Name:         req.Name,
		PasswordHash: string(hashedPassword),
		Role:         model.RoleUser,
		CreatedAt:    time.Now(),
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *authService) Login(ctx context.Context, req *model.LoginRequest) (string, *model.User, error) {
	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return "", nil, err
	}
	if user == nil {
		return "", nil, errors.New("invalid credentials")
	}

	// Block system user from logging in
	if user.IsSystemUser() {
		return "", nil, errors.New("invalid credentials")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	// Check if user should be admin based on env var
	adminEmails := s.config.GetAdminEmails()
	userEmailLower := strings.ToLower(user.Email)
	for _, email := range adminEmails {
		if userEmailLower == email && user.Role != model.RoleAdmin {
			// Promote to admin
			user.Role = model.RoleAdmin
			_ = s.userRepo.UpdateRole(ctx, user.ID, string(model.RoleAdmin))
		}
	}

	// Find user's families (get the first one they're a member of)
	familyMembers, err := s.familyRepo.FindFamiliesByUserID(ctx, user.ID)
	var familyID string
	if err == nil && len(familyMembers) > 0 {
		familyID = familyMembers[0].FamilyID
	}

	// Create session
	sessionID := uuid.New().String()
	sessionData := &model.SessionData{
		UserID:    user.ID,
		FamilyID:  familyID,
		UserRole:  string(user.Role),
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}

	if err := s.sessionRepo.Create(ctx, sessionID, sessionData, 7*24*time.Hour); err != nil {
		return "", nil, err
	}

	return sessionID, user, nil
}

func (s *authService) Logout(ctx context.Context, sessionID string) error {
	return s.sessionRepo.Delete(ctx, sessionID)
}

func (s *authService) ValidateSession(ctx context.Context, sessionID string) (*model.SessionData, error) {
	session, err := s.sessionRepo.Get(ctx, sessionID)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, errors.New("invalid session")
	}

	// Check if session expired
	if time.Now().After(session.ExpiresAt) {
		_ = s.sessionRepo.Delete(ctx, sessionID)
		return nil, errors.New("session expired")
	}

	// If user_role is missing in session (legacy sessions), look it up from database
	if session.UserRole == "" {
		user, err := s.userRepo.FindByID(ctx, session.UserID)
		if err == nil && user != nil {
			session.UserRole = string(user.Role)
			// Update session with role
			_ = s.sessionRepo.Create(ctx, sessionID, session, 7*24*time.Hour)
		}
	}

	return session, nil
}

func (s *authService) UpdateSessionFamily(ctx context.Context, sessionID, familyID string) error {
	session, err := s.sessionRepo.Get(ctx, sessionID)
	if err != nil {
		return err
	}
	if session == nil {
		return errors.New("invalid session")
	}

	session.FamilyID = familyID
	// Preserve UserRole when updating
	return s.sessionRepo.Create(ctx, sessionID, session, 7*24*time.Hour)
}