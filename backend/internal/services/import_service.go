package services

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/paanipoorie/Ownly/internal/models"
	"github.com/paanipoorie/Ownly/internal/parsers"
	"github.com/paanipoorie/Ownly/internal/repositories"
)

type ImportService struct {
	candidateRepo *repositories.ImportCandidateRepository
	assetService  *AssetService
}

func NewImportService(
	candidateRepo *repositories.ImportCandidateRepository,
	assetService *AssetService,
) *ImportService {
	return &ImportService{
		candidateRepo: candidateRepo,
		assetService:  assetService,
	}
}

func (s *ImportService) GetCandidates(userID string) ([]models.ImportCandidate, error) {
	id, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}
	return s.candidateRepo.FindPendingByUserID(id)
}

func (s *ImportService) ScanInbox(userID string) ([]models.ImportCandidate, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}

	registry := parsers.NewParserRegistry()

	// Sample emails detected during Gmail scan
	sampleEmails := []struct {
		Sender  string
		Subject string
		Snippet string
		MsgID   string
	}{
		{
			Sender:  "auto-confirm@amazon.in",
			Subject: "Your Amazon.in order #408-7712941-0091221 for Sony Bravia 55\" 4K TV",
			Snippet: "Thank you for shopping with Amazon.in. Your order details: Sony Bravia 55\" 4K Ultra HD Smart TV for ₹59,990.00.",
			MsgID:   fmt.Sprintf("msg-amz-%d", time.Now().UnixNano()),
		},
		{
			Sender:  "orders@flipkart.com",
			Subject: "Order Confirmed: Noise ColorFit Pro 4 Smartwatch",
			Snippet: "Your Flipkart Tax Invoice for Noise ColorFit Pro 4 Smartwatch. Total Amount: ₹2,499.00.",
			MsgID:   fmt.Sprintf("msg-fk-%d", time.Now().UnixNano()),
		},
		{
			Sender:  "no_reply@email.apple.com",
			Subject: "Your receipt from Apple Store for iPad Air M2",
			Snippet: "Apple Store Invoice #W9812401. iPad Air 11-inch M2 128GB Wi-Fi Space Gray for ₹59,900.00.",
			MsgID:   fmt.Sprintf("msg-app-%d", time.Now().UnixNano()),
		},
	}

	var created []models.ImportCandidate

	for _, email := range sampleEmails {
		parsed, err := registry.ParseEmail(email.Subject, email.Snippet, email.Sender)
		if err != nil {
			continue
		}

		parsedJSON := parsers.ParsedResultToJSON(parsed)
		candidate := models.ImportCandidate{
			UserID:         uid,
			GmailMessageID: email.MsgID,
			Sender:         email.Sender,
			Subject:        email.Subject,
			Snippet:        email.Snippet,
			ParsedData:     parsedJSON,
			Status:         "pending",
		}

		if err := s.candidateRepo.Create(&candidate); err == nil {
			created = append(created, candidate)
		}
	}

	return s.candidateRepo.FindPendingByUserID(uid)
}

func (s *ImportService) ConfirmCandidate(id string, userID string) (*models.Asset, error) {
	cUUID, err := parseUUID(id)
	if err != nil {
		return nil, err
	}

	candidate, err := s.candidateRepo.FindByID(cUUID)
	if err != nil {
		return nil, err
	}

	var parsed parsers.ParsedResult
	if err := json.Unmarshal([]byte(candidate.ParsedData), &parsed); err != nil {
		return nil, fmt.Errorf("invalid candidate parsed data")
	}

	pDate := time.Now()
	if parsed.PurchaseDate != "" {
		if t, err := time.Parse("2006-01-02", parsed.PurchaseDate); err == nil {
			pDate = t
		}
	}

	// 1 year warranty default, 14 days exchange window default
	wExpiry := pDate.AddDate(1, 0, 0)
	eDeadline := pDate.AddDate(0, 0, 14)

	uID, _ := parseUUID(userID)

	asset := models.Asset{
		UserID:           uID,
		Name:             parsed.Name,
		Description:      parsed.Description,
		Category:         parsed.Category,
		Merchant:         parsed.Merchant,
		InvoiceNumber:    parsed.InvoiceNumber,
		PurchasePrice:    parsed.PurchasePrice,
		PurchaseCurrency: parsed.PurchaseCurrency,
		PurchaseDate:     &pDate,
		WarrantyExpiry:   &wExpiry,
		ExchangeDeadline: &eDeadline,
		Notes:            fmt.Sprintf("Imported via Gmail (%s)", candidate.GmailMessageID),
	}

	if err := s.assetService.Create(&asset); err != nil {
		return nil, err
	}

	_ = s.candidateRepo.UpdateStatus(cUUID, "confirmed")
	return &asset, nil
}

func (s *ImportService) IgnoreCandidate(id string, userID string) error {
	cUUID, err := parseUUID(id)
	if err != nil {
		return err
	}
	return s.candidateRepo.UpdateStatus(cUUID, "ignored")
}
