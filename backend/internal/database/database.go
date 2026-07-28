package database

import (
	"log"
	"time"

	"github.com/paanipoorie/Ownly/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(dsn string) *gorm.DB {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB: %v", err)
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	return db
}

func AutoMigrate(db *gorm.DB) {
	if err := db.AutoMigrate(
		&models.User{},
		&models.Session{},
		&models.Asset{},
		&models.ImportCandidate{},
		&models.TimelineEvent{},
		&models.Reminder{},
	); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}
}