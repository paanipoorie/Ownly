package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port            int
	DatabaseURL     string
	GoogleClientID  string
	GoogleSecret    string
	GoogleRedirect  string
	SessionSecret   string
	FrontendURL     string
	ResendAPIKey    string
	R2AccountID     string
	R2AccessKeyID   string
	R2SecretKey     string
	R2BucketName    string
	R2PublicURL     string
	CSRFSecret      string
	Env             string
}

func Load() *Config {
	return &Config{
		Port:           getEnvInt("PORT", 3000),
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/ownly?sslmode=disable"),
		GoogleClientID: getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleSecret:   getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirect: getEnv("GOOGLE_REDIRECT_URL", "http://localhost:3000/api/auth/callback"),
		SessionSecret:  getEnv("SESSION_SECRET", "change-me-to-a-random-secret"),
		FrontendURL:    getEnv("FRONTEND_URL", "http://localhost:5173"),
		ResendAPIKey:   getEnv("RESEND_API_KEY", ""),
		R2AccountID:    getEnv("R2_ACCOUNT_ID", ""),
		R2AccessKeyID:  getEnv("R2_ACCESS_KEY_ID", ""),
		R2SecretKey:    getEnv("R2_SECRET_ACCESS_KEY", ""),
		R2BucketName:   getEnv("R2_BUCKET_NAME", "ownly-assets"),
		R2PublicURL:    getEnv("R2_PUBLIC_URL", ""),
		CSRFSecret:     getEnv("CSRF_SECRET", "change-me-csrf-secret"),
		Env:            getEnv("ENV", "development"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}