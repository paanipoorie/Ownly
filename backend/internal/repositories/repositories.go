package repositories

import (
	"time"

	"github.com/google/uuid"
	"github.com/paanipoorie/Ownly/internal/models"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) FindByGoogleID(googleID string) (*models.User, error) {
	var user models.User
	err := r.db.Where("google_id = ?", googleID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

type SessionRepository struct {
	db *gorm.DB
}

func NewSessionRepository(db *gorm.DB) *SessionRepository {
	return &SessionRepository{db: db}
}

func (r *SessionRepository) Create(session *models.Session) error {
	return r.db.Create(session).Error
}

func (r *SessionRepository) FindByToken(token string) (*models.Session, error) {
	var session models.Session
	err := r.db.Preload("User").Where("token = ? AND expires_at > NOW()", token).First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *SessionRepository) DeleteByToken(token string) error {
	return r.db.Where("token = ?", token).Delete(&models.Session{}).Error
}

func (r *SessionRepository) DeleteByUserID(userID uuid.UUID) error {
	return r.db.Where("user_id = ?", userID).Delete(&models.Session{}).Error
}

func (r *SessionRepository) DeleteExpired() error {
	return r.db.Where("expires_at <= NOW()").Delete(&models.Session{}).Error
}

type AssetRepository struct {
	db *gorm.DB
}

func NewAssetRepository(db *gorm.DB) *AssetRepository {
	return &AssetRepository{db: db}
}

func (r *AssetRepository) Create(asset *models.Asset) error {
	return r.db.Create(asset).Error
}

func (r *AssetRepository) FindByID(id uuid.UUID) (*models.Asset, error) {
	var asset models.Asset
	err := r.db.First(&asset, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &asset, nil
}

func (r *AssetRepository) FindByIDAndUserID(id uuid.UUID, userID uuid.UUID) (*models.Asset, error) {
	var asset models.Asset
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&asset).Error
	if err != nil {
		return nil, err
	}
	return &asset, nil
}

func (r *AssetRepository) FindByUserID(userID uuid.UUID) ([]models.Asset, error) {
	var assets []models.Asset
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&assets).Error
	return assets, err
}

func (r *AssetRepository) Update(asset *models.Asset) error {
	return r.db.Save(asset).Error
}

func (r *AssetRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Asset{}, "id = ?", id).Error
}

func (r *AssetRepository) DeleteByIDAndUserID(id uuid.UUID, userID uuid.UUID) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Asset{}).Error
}

func (r *AssetRepository) Search(userID uuid.UUID, query string, category string) ([]models.Asset, error) {
	var assets []models.Asset
	db := r.db.Where("user_id = ?", userID)

	if query != "" {
		pattern := "%" + query + "%"
		db = db.Where(
			"name ILIKE ? OR merchant ILIKE ? OR invoice_number ILIKE ? OR notes ILIKE ? OR description ILIKE ? OR category ILIKE ?",
			pattern, pattern, pattern, pattern, pattern, pattern,
		)
	}

	if category != "" && category != "all" {
		db = db.Where("category = ?", category)
	}

	err := db.Order("created_at DESC").Find(&assets).Error
	return assets, err
}

type ImportCandidateRepository struct {
	db *gorm.DB
}

func NewImportCandidateRepository(db *gorm.DB) *ImportCandidateRepository {
	return &ImportCandidateRepository{db: db}
}

func (r *ImportCandidateRepository) Create(candidate *models.ImportCandidate) error {
	return r.db.Create(candidate).Error
}

func (r *ImportCandidateRepository) FindPendingByUserID(userID uuid.UUID) ([]models.ImportCandidate, error) {
	var candidates []models.ImportCandidate
	err := r.db.Where("user_id = ? AND status = ?", userID, "pending").
		Order("created_at DESC").Find(&candidates).Error
	return candidates, err
}

func (r *ImportCandidateRepository) FindByID(id uuid.UUID) (*models.ImportCandidate, error) {
	var candidate models.ImportCandidate
	err := r.db.First(&candidate, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &candidate, nil
}

func (r *ImportCandidateRepository) UpdateStatus(id uuid.UUID, status string) error {
	return r.db.Model(&models.ImportCandidate{}).Where("id = ?", id).
		Update("status", status).Error
}

type TimelineEventRepository struct {
	db *gorm.DB
}

func NewTimelineEventRepository(db *gorm.DB) *TimelineEventRepository {
	return &TimelineEventRepository{db: db}
}

func (r *TimelineEventRepository) Create(event *models.TimelineEvent) error {
	return r.db.Create(event).Error
}

func (r *TimelineEventRepository) FindByUserID(userID uuid.UUID) ([]models.TimelineEvent, error) {
	var events []models.TimelineEvent
	err := r.db.Preload("Asset").Where("user_id = ?", userID).
		Order("event_date DESC, created_at DESC").Find(&events).Error
	return events, err
}

func (r *TimelineEventRepository) FindByAssetID(assetID uuid.UUID) ([]models.TimelineEvent, error) {
	var events []models.TimelineEvent
	err := r.db.Where("asset_id = ?", assetID).
		Order("event_date DESC").Find(&events).Error
	return events, err
}

func (r *TimelineEventRepository) DeleteByAssetID(assetID uuid.UUID) error {
	return r.db.Where("asset_id = ?", assetID).Delete(&models.TimelineEvent{}).Error
}

type ReminderRepository struct {
	db *gorm.DB
}

func NewReminderRepository(db *gorm.DB) *ReminderRepository {
	return &ReminderRepository{db: db}
}

func (r *ReminderRepository) Create(reminder *models.Reminder) error {
	return r.db.Create(reminder).Error
}

func (r *ReminderRepository) FindByUserID(userID uuid.UUID) ([]models.Reminder, error) {
	var reminders []models.Reminder
	err := r.db.Where("user_id = ?", userID).
		Order("scheduled_for ASC").Find(&reminders).Error
	return reminders, err
}

func (r *ReminderRepository) FindDue() ([]models.Reminder, error) {
	var reminders []models.Reminder
	err := r.db.Preload("User").
		Where("sent_at IS NULL AND scheduled_for <= NOW()").
		Find(&reminders).Error
	return reminders, err
}

func (r *ReminderRepository) MarkSent(id uuid.UUID) error {
	now := time.Now()
	return r.db.Model(&models.Reminder{}).Where("id = ?", id).
		Update("sent_at", &now).Error
}

func (r *ReminderRepository) DeleteByAssetID(assetID uuid.UUID) error {
	return r.db.Where("asset_id = ?", assetID).Delete(&models.Reminder{}).Error
}