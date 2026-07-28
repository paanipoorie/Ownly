package services

import (
	"fmt"
	"log"

	"github.com/paanipoorie/Ownly/internal/models"
)

type EmailService struct{}

func NewEmailService() *EmailService {
	return &EmailService{}
}

func (s *EmailService) SendReminderEmail(user *models.User, reminder *models.Reminder, asset *models.Asset) error {
	var subject, body string

	assetName := "Item"
	if asset != nil {
		assetName = asset.Name
	}

	if reminder.ReminderType == "warranty_7day" {
		subject = fmt.Sprintf("⚠️ Warranty Expiring Soon: %s", assetName)
		body = fmt.Sprintf("Hi %s,\n\nYour warranty for %s is expiring in 7 days (on %s).\nLog in to Ownly to review your invoice or file a claim.",
			user.Name, assetName, reminder.ScheduledFor.AddDate(0, 0, 7).Format("2006-01-02"))
	} else if reminder.ReminderType == "exchange_3day" {
		subject = fmt.Sprintf("⏳ Exchange Deadline Approaching: %s", assetName)
		body = fmt.Sprintf("Hi %s,\n\nYour return/exchange window for %s closes in 3 days (on %s).\nLog in to Ownly to check exchange instructions.",
			user.Name, assetName, reminder.ScheduledFor.AddDate(0, 0, 3).Format("2006-01-02"))
	} else {
		subject = fmt.Sprintf("Reminder for %s", assetName)
		body = fmt.Sprintf("Hi %s,\n\nYou have an upcoming reminder for %s scheduled for %s.",
			user.Name, assetName, reminder.ScheduledFor.Format("2006-01-02"))
	}

	// Log simulated / dispatched email delivery
	log.Printf("[Email Engine] Sending email to %s <%s> | Subject: %s\nBody:\n%s\n", user.Name, user.Email, subject, body)
	return nil
}
