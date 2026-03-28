package bootstrap

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"

	"money-tracker-be/internal/config"
	"money-tracker-be/internal/repository"
	"money-tracker-be/internal/service"
)

type Container struct {
	Config *config.Config
	DB     *pgxpool.Pool
	Redis  *redis.Client

	// Repositories
	UserRepo         repository.UserRepository
	FamilyRepo       repository.FamilyRepository
	InviteRepo       repository.InviteRepository
	CategoryRepo     repository.CategoryRepository
	TransactionRepo  repository.TransactionRepository
	SessionRepo      repository.SessionRepository
	BankAccountRepo  repository.BankAccountRepository

	// Services
	AuthService      service.AuthService
	FamilyService    service.FamilyService
	InviteService    service.InviteService
	CategoryService  service.CategoryService
	TransactionService service.TransactionService
	AdminService     service.AdminService
	BankAccountService service.BankAccountService
}

func NewContainer(cfg *config.Config) (*Container, error) {
	// Initialize PostgreSQL connection pool
	dbPool, err := pgxpool.New(context.Background(), cfg.DSN())
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Test database connection
	if err := dbPool.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}
	log.Println("Connected to PostgreSQL")

	// Initialize Redis client
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr(),
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})

	// Test Redis connection
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		dbPool.Close()
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}
	log.Println("Connected to Redis")

	// Initialize repositories
	userRepo := repository.NewUserRepository(dbPool)
	familyRepo := repository.NewFamilyRepository(dbPool)
	inviteRepo := repository.NewInviteRepository(dbPool)
	categoryRepo := repository.NewCategoryRepository(dbPool)
	transactionRepo := repository.NewTransactionRepository(dbPool)
	sessionRepo := repository.NewSessionRepository(rdb)
	bankAccountRepo := repository.NewBankAccountRepository(dbPool)

	// Initialize services
	authService := service.NewAuthService(userRepo, familyRepo, sessionRepo, cfg)
	familyService := service.NewFamilyService(familyRepo, transactionRepo)
	inviteService := service.NewInviteService(inviteRepo, familyRepo, familyService)
	categoryService := service.NewCategoryService(categoryRepo)
	transactionService := service.NewTransactionService(transactionRepo)
	adminService := service.NewAdminService(transactionRepo, familyRepo, userRepo)
	bankAccountService := service.NewBankAccountService(bankAccountRepo)

	return &Container{
		Config: cfg,
		DB:     dbPool,
		Redis:  rdb,

		UserRepo:        userRepo,
		FamilyRepo:      familyRepo,
		InviteRepo:      inviteRepo,
		CategoryRepo:    categoryRepo,
		TransactionRepo: transactionRepo,
		SessionRepo:     sessionRepo,
		BankAccountRepo: bankAccountRepo,

		AuthService:      authService,
		FamilyService:    familyService,
		InviteService:    inviteService,
		CategoryService:  categoryService,
		TransactionService: transactionService,
		AdminService:     adminService,
		BankAccountService: bankAccountService,
	}, nil
}

func (c *Container) Close() {
	if c.DB != nil {
		c.DB.Close()
	}
	if c.Redis != nil {
		c.Redis.Close()
	}
}