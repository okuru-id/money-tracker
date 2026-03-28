package router

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"money-tracker-be/internal/bootstrap"
	"money-tracker-be/internal/handler"
	"money-tracker-be/internal/middleware"
)

func New(container *bootstrap.Container) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	if container.Config.ServerEnv == "development" {
		gin.SetMode(gin.DebugMode)
	}

	// Configure cookie secure flag
	middleware.SetCookieSecure(container.Config.CookieSecure)

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.Recovery())

	// CORS middleware
	r.Use(middleware.CORS(container.Config.CORSOrigins))

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Initialize handlers
	authHandler := handler.NewAuthHandler(container.AuthService)
	familyHandler := handler.NewFamilyHandler(container.FamilyService, container.FamilyRepo, container.AuthService)
	inviteHandler := handler.NewInviteHandler(container.InviteService)
	categoryHandler := handler.NewCategoryHandler(container.CategoryService)
	transactionHandler := handler.NewTransactionHandler(container.TransactionService)
	adminHandler := handler.NewAdminHandler(container.AdminService)

	// Rate limiters
	inMemoryRL := middleware.NewInMemoryRateLimit()

	// API routes
	api := r.Group("/api")
	{
		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", inMemoryRL.Middleware(middleware.RegisterRateLimit), authHandler.Register)
			auth.POST("/login", inMemoryRL.Middleware(middleware.LoginRateLimit), authHandler.Login)
			auth.POST("/logout", authHandler.Logout)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.Auth(container.AuthService, 7*24*time.Hour))
		{
			// Auth me endpoint (protected)
			protected.GET("/auth/me", authHandler.Me)
			// Family routes
			families := protected.Group("/families")
			{
				families.POST("", familyHandler.Create)
				families.GET("/:id/summary", middleware.RequireFamily(), familyHandler.GetSummary)
				families.GET("/:id/members", middleware.RequireFamily(), familyHandler.GetMembers)
				families.DELETE("/:id/members/:userId", middleware.RequireFamily(), familyHandler.RemoveMember)
				families.POST("/:id/invites", inMemoryRL.Middleware(middleware.InviteRateLimit), middleware.RequireFamily(), inviteHandler.CreateInvite)
			}

			// Invite routes
			invites := protected.Group("/invites")
			{
				invites.POST("/:token/join", inviteHandler.JoinWithToken)
			}

			// Transaction routes
			protected.GET("/transactions/summary", transactionHandler.GetPersonalSummary)
			protected.GET("/transactions", transactionHandler.List)
			protected.POST("/transactions", transactionHandler.Create)
			protected.PATCH("/transactions/:id", transactionHandler.Update)
			protected.DELETE("/transactions/:id", transactionHandler.Delete)

			// Category routes
			protected.GET("/categories", categoryHandler.List)

			// Admin routes
			handler.RegisterAdminRoutes(api, adminHandler, container.AuthService, 7*24*time.Hour)
		}
	}

	return r
}