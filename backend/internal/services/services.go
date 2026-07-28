package services

import (
	"github.com/paanipoorie/Ownly/internal/models"
	"github.com/paanipoorie/Ownly/internal/repositories"
)

type ImportService struct {
	candidateRepo *repositories.ImportCandidateRepository
}

func NewImportService(candidateRepo *repositories.ImportCandidateRepository) *ImportService {
	return &ImportService{candidateRepo: candidateRepo}
}

func (s *ImportService) GetCandidates(userID string) ([]models.ImportCandidate, error) {
	id, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}
	return s.candidateRepo.FindPendingByUserID(id)
}

func (s *ImportService) ConfirmCandidate(id string) error {
	uid, err := parseUUID(id)
	if err != nil {
		return err
	}
	return s.candidateRepo.UpdateStatus(uid, "confirmed")
}

func (s *ImportService) IgnoreCandidate(id string) error {
	uid, err := parseUUID(id)
	if err != nil {
		return err
	}
	return s.candidateRepo.UpdateStatus(uid, "ignored")
}

type ReminderService struct {
	reminderRepo *repositories.ReminderRepository
}

func NewReminderService(reminderRepo *repositories.ReminderRepository) *ReminderService {
	return &ReminderService{reminderRepo: reminderRepo}
}

func (s *ReminderService) GetDue() ([]models.Reminder, error) {
	return s.reminderRepo.FindDue()
}

func (s *ReminderService) MarkSent(id string) error {
	uid, err := parseUUID(id)
	if err != nil {
		return err
	}
	return s.reminderRepo.MarkSent(uid)
}

type TimelineService struct {
	eventRepo *repositories.TimelineEventRepository
}

func NewTimelineService(eventRepo *repositories.TimelineEventRepository) *TimelineService {
	return &TimelineService{eventRepo: eventRepo}
}

func (s *TimelineService) ListByUser(userID string) ([]models.TimelineEvent, error) {
	id, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}
	return s.eventRepo.FindByUserID(id)
}

type StorageService struct{}

func NewStorageService() *StorageService {
	return &StorageService{}
}

type SearchService struct{}

func NewSearchService() *SearchService {
	return &SearchService{}
}