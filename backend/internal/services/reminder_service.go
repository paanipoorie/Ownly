package services

import (
	"log"
	"time"

	"github.com/paanipoorie/Ownly/internal/models"
	"github.com/paanipoorie/Ownly/internal/repositories"
)

type ReminderService struct {
	reminderRepo *repositories.ReminderRepository
	assetRepo    *repositories.AssetRepository
	emailService *EmailService
}

func NewReminderService(
	reminderRepo *repositories.ReminderRepository,
	assetRepo *repositories.AssetRepository,
	emailService *EmailService,
) *ReminderService {
	return &ReminderService{
		reminderRepo: reminderRepo,
		assetRepo:    assetRepo,
		emailService: emailService,
	}
}

func (s *ReminderService) GetDue() ([]models.Reminder, error) {
	return s.reminderRepo.FindDue()
}

func (s *ReminderService) ListByUser(userID string) ([]models.Reminder, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}
	return s.reminderRepo.FindByUserID(uid)
}

func (s *ReminderService) ProcessDueReminders() (int, error) {
	reminders, err := s.reminderRepo.FindDue()
	if err != nil {
		return 0, err
	}

	processedCount := 0
	for _, reminder := range reminders {
		var asset *models.Asset
		if reminder.AssetID != nil {
			asset, _ = s.assetRepo.FindByID(*reminder.AssetID)
		}

		if err := s.emailService.SendReminderEmail(&reminder.User, &reminder, asset); err == nil {
			_ = s.reminderRepo.MarkSent(reminder.ID)
			processedCount++
		}
	}

	return processedCount, nil
}

func (s *ReminderService) StartScheduler(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			count, err := s.ProcessDueReminders()
			if err != nil {
				log.Printf("[Reminder Scheduler] Error processing due reminders: %v", err)
			} else if count > 0 {
				log.Printf("[Reminder Scheduler] Successfully processed and delivered %d reminder email(s)", count)
			}
		}
	}()
}
