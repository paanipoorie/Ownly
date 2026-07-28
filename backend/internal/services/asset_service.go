package services

import (
	"fmt"
	"time"

	"github.com/paanipoorie/Ownly/internal/models"
	"github.com/paanipoorie/Ownly/internal/repositories"
)

type AssetService struct {
	assetRepo    *repositories.AssetRepository
	eventRepo    *repositories.TimelineEventRepository
	reminderRepo *repositories.ReminderRepository
}

func NewAssetService(
	assetRepo *repositories.AssetRepository,
	eventRepo *repositories.TimelineEventRepository,
	reminderRepo *repositories.ReminderRepository,
) *AssetService {
	return &AssetService{
		assetRepo:    assetRepo,
		eventRepo:    eventRepo,
		reminderRepo: reminderRepo,
	}
}

func (s *AssetService) Create(asset *models.Asset) error {
	if err := s.assetRepo.Create(asset); err != nil {
		return err
	}
	s.syncTimelineAndReminders(asset)
	return nil
}

func (s *AssetService) GetByID(id string, userID string) (*models.Asset, error) {
	assetUUID, err := parseUUID(id)
	if err != nil {
		return nil, err
	}
	userUUID, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}
	return s.assetRepo.FindByIDAndUserID(assetUUID, userUUID)
}

func (s *AssetService) ListByUser(userID string) ([]models.Asset, error) {
	uuid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}
	return s.assetRepo.FindByUserID(uuid)
}

func (s *AssetService) Update(asset *models.Asset) error {
	if err := s.assetRepo.Update(asset); err != nil {
		return err
	}
	_ = s.eventRepo.DeleteByAssetID(asset.ID)
	_ = s.reminderRepo.DeleteByAssetID(asset.ID)
	s.syncTimelineAndReminders(asset)
	return nil
}

func (s *AssetService) Delete(id string, userID string) error {
	assetUUID, err := parseUUID(id)
	if err != nil {
		return err
	}
	userUUID, err := parseUUID(userID)
	if err != nil {
		return err
	}
	_ = s.eventRepo.DeleteByAssetID(assetUUID)
	_ = s.reminderRepo.DeleteByAssetID(assetUUID)
	return s.assetRepo.DeleteByIDAndUserID(assetUUID, userUUID)
}

func (s *AssetService) syncTimelineAndReminders(asset *models.Asset) {
	purchaseDate := time.Now()
	if asset.PurchaseDate != nil {
		purchaseDate = *asset.PurchaseDate
	}
	desc := ""
	if asset.Merchant != "" {
		desc = fmt.Sprintf("Merchant: %s", asset.Merchant)
	}
	if asset.PurchasePrice > 0 {
		if desc != "" {
			desc += " | "
		}
		desc += fmt.Sprintf("Price: %s %.2f", asset.PurchaseCurrency, asset.PurchasePrice)
	}

	purchaseEvent := models.TimelineEvent{
		UserID:      asset.UserID,
		AssetID:     &asset.ID,
		EventType:   "purchase",
		Title:       "Purchased " + asset.Name,
		Description: desc,
		EventDate:   purchaseDate,
	}
	_ = s.eventRepo.Create(&purchaseEvent)

	if asset.WarrantyExpiry != nil {
		warrantyEvent := models.TimelineEvent{
			UserID:      asset.UserID,
			AssetID:     &asset.ID,
			EventType:   "warranty",
			Title:       "Warranty Expiry: " + asset.Name,
			Description: fmt.Sprintf("Warranty expires on %s", asset.WarrantyExpiry.Format("2006-01-02")),
			EventDate:   *asset.WarrantyExpiry,
		}
		_ = s.eventRepo.Create(&warrantyEvent)

		reminderTime := asset.WarrantyExpiry.AddDate(0, 0, -7)
		reminder := models.Reminder{
			UserID:       asset.UserID,
			AssetID:      &asset.ID,
			ReminderType: "warranty_7day",
			ScheduledFor: reminderTime,
		}
		_ = s.reminderRepo.Create(&reminder)
	}

	if asset.ExchangeDeadline != nil {
		exchangeEvent := models.TimelineEvent{
			UserID:      asset.UserID,
			AssetID:     &asset.ID,
			EventType:   "exchange",
			Title:       "Exchange Deadline: " + asset.Name,
			Description: fmt.Sprintf("Exchange deadline is %s", asset.ExchangeDeadline.Format("2006-01-02")),
			EventDate:   *asset.ExchangeDeadline,
		}
		_ = s.eventRepo.Create(&exchangeEvent)

		reminderTime := asset.ExchangeDeadline.AddDate(0, 0, -3)
		reminder := models.Reminder{
			UserID:       asset.UserID,
			AssetID:      &asset.ID,
			ReminderType: "exchange_3day",
			ScheduledFor: reminderTime,
		}
		_ = s.reminderRepo.Create(&reminder)
	}
}