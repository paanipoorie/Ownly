package services

import (
	"github.com/paanipoorie/Ownly/internal/models"
	"github.com/paanipoorie/Ownly/internal/repositories"
)

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

type SearchService struct {
	assetRepo *repositories.AssetRepository
}

func NewSearchService(assetRepo *repositories.AssetRepository) *SearchService {
	return &SearchService{assetRepo: assetRepo}
}

func (s *SearchService) Search(userID string, query string, category string) ([]models.Asset, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}
	return s.assetRepo.Search(uid, query, category)
}