package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/paanipoorie/Ownly/internal/config"
	"github.com/paanipoorie/Ownly/internal/database"
	"github.com/paanipoorie/Ownly/internal/handlers"
	"github.com/paanipoorie/Ownly/internal/middleware"
	"github.com/paanipoorie/Ownly/internal/repositories"
	"github.com/paanipoorie/Ownly/internal/services"
)

func main() {
	cfg := config.Load()

	db := database.Connect(cfg.DatabaseURL)
	database.AutoMigrate(db)

	userRepo := repositories.NewUserRepository(db)
	sessionRepo := repositories.NewSessionRepository(db)
	assetRepo := repositories.NewAssetRepository(db)
	candidateRepo := repositories.NewImportCandidateRepository(db)
	eventRepo := repositories.NewTimelineEventRepository(db)
	reminderRepo := repositories.NewReminderRepository(db)

	emailService := services.NewEmailService()
	reminderService := services.NewReminderService(reminderRepo, assetRepo, emailService)
	reminderService.StartScheduler(1 * time.Hour)

	authService := services.NewAuthService(userRepo, sessionRepo, cfg.SessionSecret)
	assetService := services.NewAssetService(assetRepo, eventRepo, reminderRepo)
	importService := services.NewImportService(candidateRepo, assetService)
	timelineService := services.NewTimelineService(eventRepo)
	_ = services.NewStorageService()
	searchService := services.NewSearchService(assetRepo)

	authHandler := handlers.NewAuthHandler(authService, cfg.GoogleClientID, cfg.GoogleSecret, cfg.GoogleRedirect)
	assetHandler := handlers.NewAssetHandler(assetService)
	timelineHandler := handlers.NewTimelineHandler(timelineService)
	uploadHandler := handlers.NewUploadHandler()
	searchHandler := handlers.NewSearchHandler(searchService)
	importHandler := handlers.NewImportHandler(importService)
	reminderHandler := handlers.NewReminderHandler(reminderService)

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		},
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.FrontendURL,
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
	}))

	app.Static("/uploads", "./uploads")

	api := app.Group("/api")

	auth := api.Group("/auth")
	auth.Get("/login", authHandler.Login)
	auth.Get("/callback", authHandler.Callback)
	auth.Get("/me", middleware.AuthMiddleware(authService), authHandler.Me)
	auth.Post("/logout", middleware.AuthMiddleware(authService), authHandler.Logout)

	assets := api.Group("/assets", middleware.AuthMiddleware(authService))
	assets.Get("/", assetHandler.List)
	assets.Get("/:id", assetHandler.Get)
	assets.Post("/", assetHandler.Create)
	assets.Put("/:id", assetHandler.Update)
	assets.Delete("/:id", assetHandler.Delete)

	timeline := api.Group("/timeline", middleware.AuthMiddleware(authService))
	timeline.Get("/", timelineHandler.List)

	imports := api.Group("/imports", middleware.AuthMiddleware(authService))
	imports.Get("/", importHandler.List)
	imports.Post("/scan", importHandler.Scan)
	imports.Post("/:id/confirm", importHandler.Confirm)
	imports.Post("/:id/ignore", importHandler.Ignore)

	reminders := api.Group("/reminders", middleware.AuthMiddleware(authService))
	reminders.Get("/", reminderHandler.List)
	reminders.Post("/process", reminderHandler.Process)

	api.Get("/search", middleware.AuthMiddleware(authService), searchHandler.Search)
	api.Post("/upload", middleware.AuthMiddleware(authService), uploadHandler.Upload)

	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	addr := fmt.Sprintf(":%d", cfg.Port)
	log.Printf("server starting on %s", addr)
	log.Fatal(app.Listen(addr))
}