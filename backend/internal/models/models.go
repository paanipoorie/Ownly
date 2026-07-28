package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Email     string    `gorm:"uniqueIndex;not null;size:255" json:"email"`
	Name      string    `gorm:"size:255" json:"name"`
	AvatarURL string    `gorm:"size:1024" json:"avatar_url"`
	GoogleID  string    `gorm:"uniqueIndex;size:255" json:"google_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

type Session struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Token     string    `gorm:"uniqueIndex;not null;size:512" json:"-"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

func (s *Session) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

type Asset struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID  `gorm:"type:uuid;not null;index" json:"user_id"`
	User            User       `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Name            string     `gorm:"not null;size:255" json:"name"`
	Description     string     `gorm:"size:1024" json:"description"`
	Category        string     `gorm:"size:100" json:"category"`
	Merchant        string     `gorm:"size:255" json:"merchant"`
	InvoiceNumber   string     `gorm:"size:255" json:"invoice_number"`
	PurchasePrice   float64    `gorm:"type:decimal(10,2)" json:"purchase_price"`
	PurchaseCurrency string   `gorm:"size:3;default:INR" json:"purchase_currency"`
	PurchaseDate    *time.Time `json:"purchase_date"`
	WarrantyExpiry  *time.Time `json:"warranty_expiry"`
	ExchangeDeadline *time.Time `json:"exchange_deadline"`
	Notes           string     `gorm:"size:2048" json:"notes"`
	ImageURL        string     `gorm:"size:1024" json:"image_url"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

func (a *Asset) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

type ImportCandidate struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	User           User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	GmailMessageID string    `gorm:"not null;size:255" json:"gmail_message_id"`
	Sender         string    `gorm:"size:255" json:"sender"`
	Subject        string    `gorm:"size:1024" json:"subject"`
	Snippet        string    `gorm:"size:2048" json:"snippet"`
	ParsedData     string    `gorm:"type:jsonb" json:"parsed_data"`
	Status         string    `gorm:"not null;size:20;default:pending" json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (i *ImportCandidate) BeforeCreate(tx *gorm.DB) error {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return nil
}

type TimelineEvent struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID  `gorm:"type:uuid;not null;index" json:"user_id"`
	User        User       `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	AssetID     *uuid.UUID `gorm:"type:uuid;index" json:"asset_id"`
	Asset       *Asset     `gorm:"foreignKey:AssetID;constraint:OnDelete:SET NULL" json:"-"`
	EventType   string     `gorm:"not null;size:50" json:"event_type"`
	Title       string     `gorm:"not null;size:255" json:"title"`
	Description string     `gorm:"size:1024" json:"description"`
	EventDate   time.Time  `gorm:"not null" json:"event_date"`
	CreatedAt   time.Time  `json:"created_at"`
}

func (t *TimelineEvent) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

type Reminder struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID        uuid.UUID  `gorm:"type:uuid;not null;index" json:"user_id"`
	User          User       `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	AssetID       *uuid.UUID `gorm:"type:uuid;index" json:"asset_id"`
	Asset         *Asset     `gorm:"foreignKey:AssetID;constraint:OnDelete:SET NULL" json:"-"`
	ReminderType  string     `gorm:"not null;size:50" json:"reminder_type"`
	ScheduledFor  time.Time  `gorm:"not null" json:"scheduled_for"`
	SentAt        *time.Time `json:"sent_at"`
	CreatedAt     time.Time  `json:"created_at"`
}

func (r *Reminder) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}