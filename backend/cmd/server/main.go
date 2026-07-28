package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/paanipoorie/Ownly/internal/config"
	"github.com/paanipoorie/Ownly/internal/database"
	"github.com/paanipoorie/Ownly/internal/handlers"
	"github.com/paanipoorie/Ownly/internal/middleware"
	"github.com/paanipoorie/Ownly/internal/models"
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
	seedService := services.NewSeedService(assetService, candidateRepo, eventRepo, reminderRepo)

	authHandler := handlers.NewAuthHandler(authService, cfg.GoogleClientID, cfg.GoogleSecret, cfg.GoogleRedirect, cfg.Env)
	assetHandler := handlers.NewAssetHandler(assetService)
	timelineHandler := handlers.NewTimelineHandler(timelineService)
	uploadHandler := handlers.NewUploadHandler()
	searchHandler := handlers.NewSearchHandler(searchService)
	importHandler := handlers.NewImportHandler(importService)
	reminderHandler := handlers.NewReminderHandler(reminderService)
	seedHandler := handlers.NewSeedHandler(seedService)

	app := fiber.New(fiber.Config{
		BodyLimit: 10 * 1024 * 1024,
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			msg := "internal server error"
			if code != fiber.StatusInternalServerError {
				msg = err.Error()
			}
			return c.Status(code).JSON(fiber.Map{"error": msg})
		},
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(limiter.New(limiter.Config{
		Max:        100,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			ip := c.IP()
			if id := c.Locals("user"); id != nil {
				if u, ok := id.(*models.User); ok {
					ip = u.ID.String()
				}
			}
			return ip
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{"error": "rate limit exceeded"})
		},
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.FrontendURL,
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-CSRF-Token",
		ExposeHeaders:    "X-CSRF-Token",
	}))
	app.Use(func(c *fiber.Ctx) error {
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-Frame-Options", "DENY")
		c.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		return c.Next()
	})

	app.Static("/uploads", "./uploads")

	api := app.Group("/api")
	api.Use(middleware.CSRFMiddleware(cfg.FrontendURL))

	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

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

	seed := api.Group("/seed", middleware.AuthMiddleware(authService))
	seed.Post("/demo", seedHandler.SeedDemo)

	api.Get("/search", middleware.AuthMiddleware(authService), searchHandler.Search)
	api.Post("/upload", middleware.AuthMiddleware(authService), uploadHandler.Upload)

	addr := fmt.Sprintf(":%d", cfg.Port)
	log.Printf("server starting on %s", addr)
	log.Fatal(app.Listen(addr))
}