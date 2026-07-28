package services

import (
	"github.com/paanipoorie/Ownly/internal/models"
	"github.com/paanipoorie/Ownly/internal/repositories"
)

type AssetService struct {
	assetRepo *repositories.AssetRepository
}

func NewAssetService(assetRepo *repositories.AssetRepository) *AssetService {
	return &AssetService{assetRepo: assetRepo}
}

func (s *AssetService) Create(asset *models.Asset) error {
	return s.assetRepo.Create(asset)
}

func (s *AssetService) GetByID(id string) (*models.Asset, error) {
	uuid, err := parseUUID(id)
	if err != nil {
		return nil, err
	}
	return s.assetRepo.FindByID(uuid)
}

func (s *AssetService) ListByUser(userID string) ([]models.Asset, error) {
	uuid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}
	return s.assetRepo.FindByUserID(uuid)
}

func (s *AssetService) Update(asset *models.Asset) error {
	return s.assetRepo.Update(asset)
}

func (s *AssetService) Delete(id string) error {
	uuid, err := parseUUID(id)
	if err != nil {
		return err
	}
	return s.assetRepo.Delete(uuid)
}