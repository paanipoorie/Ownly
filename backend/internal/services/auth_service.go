package services

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"time"

	"github.com/paanipoorie/Ownly/internal/models"
	"github.com/paanipoorie/Ownly/internal/repositories"
)

type AuthService struct {
	userRepo    *repositories.UserRepository
	sessionRepo *repositories.SessionRepository
	secret      string
}

func NewAuthService(userRepo *repositories.UserRepository, sessionRepo *repositories.SessionRepository, secret string) *AuthService {
	return &AuthService{
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
		secret:      secret,
	}
}

func (s *AuthService) FindOrCreateUser(googleID, email, name, avatarURL string) (*models.User, error) {
	user, err := s.userRepo.FindByGoogleID(googleID)
	if err == nil {
		return user, nil
	}

	user = &models.User{
		Email:     email,
		Name:      name,
		AvatarURL: avatarURL,
		GoogleID:  googleID,
	}
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AuthService) CreateSession(userID string) (*models.Session, string, error) {
	token, err := generateToken()
	if err != nil {
		return nil, "", err
	}

	session := &models.Session{
		Token:     hashToken(token),
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}
	if err := session.UserID.UnmarshalText([]byte(userID)); err != nil {
		return nil, "", err
	}

	if err := s.sessionRepo.Create(session); err != nil {
		return nil, "", err
	}
	return session, token, nil
}

func (s *AuthService) ValidateSession(token string) (*models.User, error) {
	session, err := s.sessionRepo.FindByToken(hashToken(token))
	if err != nil {
		return nil, err
	}
	return &session.User, nil
}

func (s *AuthService) DeleteSession(token string) error {
	return s.sessionRepo.DeleteByToken(hashToken(token))
}

func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func generateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}