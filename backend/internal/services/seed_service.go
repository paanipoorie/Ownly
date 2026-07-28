package services

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/paanipoorie/Ownly/internal/models"
	"github.com/paanipoorie/Ownly/internal/repositories"
)

type SeedService struct {
	assetService *AssetService
	candidateRepo *repositories.ImportCandidateRepository
	eventRepo     *repositories.TimelineEventRepository
	reminderRepo  *repositories.ReminderRepository
}

func NewSeedService(
	assetService *AssetService,
	candidateRepo *repositories.ImportCandidateRepository,
	eventRepo *repositories.TimelineEventRepository,
	reminderRepo *repositories.ReminderRepository,
) *SeedService {
	return &SeedService{
		assetService:  assetService,
		candidateRepo: candidateRepo,
		eventRepo:     eventRepo,
		reminderRepo:  reminderRepo,
	}
}

func (s *SeedService) SeedDemo(userID string) (map[string]int, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	counts := map[string]int{"assets": 0, "candidates": 0}

	demoAssets := []struct {
		Name             string
		Description      string
		Category         string
		Merchant         string
		InvoiceNumber    string
		PurchasePrice    float64
		PurchaseCurrency string
		PurchaseDate     time.Time
		WarrantyExpiry   time.Time
		ExchangeDeadline time.Time
		Notes            string
	}{
		{
			Name: "MacBook Pro 16\" M3 Max", Description: "Space Black, 36GB RAM, 1TB SSD",
			Category: "Electronics", Merchant: "Apple Store", InvoiceNumber: "INV-2026-9812",
			PurchasePrice: 349900, PurchaseCurrency: "INR",
			PurchaseDate: now.AddDate(0, 0, -45), WarrantyExpiry: now.AddDate(0, 0, 320), ExchangeDeadline: now.AddDate(0, 0, -30),
			Notes: "Covered under AppleCare+. Receipt uploaded.",
		},
		{
			Name: "Sony WH-1000XM5 Headphones", Description: "Wireless Noise Canceling Headphones in Silver",
			Category: "Electronics", Merchant: "Amazon", InvoiceNumber: "AMZ-88219-441",
			PurchasePrice: 29990, PurchaseCurrency: "INR",
			PurchaseDate: now.AddDate(0, 0, -15), WarrantyExpiry: now.AddDate(0, 0, 15), ExchangeDeadline: now.AddDate(0, 0, 2),
			Notes: "Bought during festival sale with bank discount.",
		},
		{
			Name: "Dyson V15 Detect Vacuum", Description: "Cordless vacuum cleaner with laser illumination",
			Category: "Appliances", Merchant: "Croma", InvoiceNumber: "CRM-77402",
			PurchasePrice: 62900, PurchaseCurrency: "INR",
			PurchaseDate: now.AddDate(0, 0, -400), WarrantyExpiry: now.AddDate(0, 0, -35), ExchangeDeadline: now.AddDate(0, 0, -385),
			Notes: "2 year warranty expired recently.",
		},
		{
			Name: "Herman Miller Aeron Chair", Description: "Ergonomic Office Chair, Size B, Graphite",
			Category: "Furniture", Merchant: "Herman Miller Direct", InvoiceNumber: "HM-2025-0041",
			PurchasePrice: 145000, PurchaseCurrency: "INR",
			PurchaseDate: now.AddDate(0, 0, -120), WarrantyExpiry: now.AddDate(0, 0, 3500), ExchangeDeadline: now.AddDate(0, 0, -90),
			Notes: "12-year manufacturer warranty.",
		},
		{
			Name: "iPhone 16 Pro Max", Description: "Natural Titanium, 256GB",
			Category: "Electronics", Merchant: "Apple Store", InvoiceNumber: "APL-2026-4412",
			PurchasePrice: 144900, PurchaseCurrency: "INR",
			PurchaseDate: now.AddDate(0, 0, -30), WarrantyExpiry: now.AddDate(0, 0, 335), ExchangeDeadline: now.AddDate(0, 0, -16),
			Notes: "Includes AppleCare+",
		},
	}

	for _, d := range demoAssets {
		pDate := d.PurchaseDate
		wExpiry := d.WarrantyExpiry
		eDeadline := d.ExchangeDeadline

		asset := models.Asset{
			ID:               uuid.New(),
			UserID:           uid,
			Name:             d.Name,
			Description:      d.Description,
			Category:         d.Category,
			Merchant:         d.Merchant,
			InvoiceNumber:    d.InvoiceNumber,
			PurchasePrice:    d.PurchasePrice,
			PurchaseCurrency: d.PurchaseCurrency,
			PurchaseDate:     &pDate,
			WarrantyExpiry:   &wExpiry,
			ExchangeDeadline: &eDeadline,
			Notes:            d.Notes,
		}

		if err := s.assetService.Create(&asset); err != nil {
			return nil, fmt.Errorf("failed to seed asset %s: %w", d.Name, err)
		}
		counts["assets"]++
	}

	demoCandidates := []struct {
		Sender  string
		Subject string
		Snippet string
		MsgID   string
		Parsed  string
	}{
		{
			Sender: "auto-confirm@amazon.in",
			Subject: "Your Amazon.in order #408-7712941-0091221 for Sony Bravia 55\" 4K TV",
			Snippet: "Thank you for shopping with Amazon.in. Your order details: Sony Bravia 55\" 4K Ultra HD Smart TV for ₹59,990.00.",
			MsgID:   fmt.Sprintf("msg-amz-seed-%d", now.UnixNano()),
			Parsed: `{"name":"Sony Bravia 55\" 4K Ultra HD Smart TV","merchant":"Amazon","category":"Electronics","invoice_number":"408-7712941-0091221","purchase_price":59990,"purchase_currency":"INR","purchase_date":"` + now.Format("2006-01-02") + `","description":"Imported from Seed Demo"}`,
		},
		{
			Sender:  "orders@flipkart.com",
			Subject: "Order Confirmed: Noise ColorFit Pro 4 Smartwatch",
			Snippet: "Your Flipkart Tax Invoice for Noise ColorFit Pro 4 Smartwatch. Total Amount: ₹2,499.00.",
			MsgID:   fmt.Sprintf("msg-fk-seed-%d", now.UnixNano()),
			Parsed:  `{"name":"Noise ColorFit Pro 4 Smartwatch","merchant":"Flipkart","category":"Electronics","invoice_number":"FK-990241","purchase_price":2499,"purchase_currency":"INR","purchase_date":"` + now.Format("2006-01-02") + `","description":"Imported from Seed Demo"}`,
		},
	}

	for _, d := range demoCandidates {
		candidate := models.ImportCandidate{
			ID:             uuid.New(),
			UserID:         uid,
			GmailMessageID: d.MsgID,
			Sender:         d.Sender,
			Subject:        d.Subject,
			Snippet:        d.Snippet,
			ParsedData:     d.Parsed,
			Status:         "pending",
		}
		if err := s.candidateRepo.Create(&candidate); err != nil {
			return nil, fmt.Errorf("failed to seed candidate: %w", err)
		}
		counts["candidates"]++
	}

	return counts, nil
}
