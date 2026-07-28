package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/paanipoorie/Ownly/internal/models"
	"github.com/paanipoorie/Ownly/internal/services"
)

type ReminderHandler struct {
	reminderService *services.ReminderService
}

func NewReminderHandler(reminderService *services.ReminderService) *ReminderHandler {
	return &ReminderHandler{reminderService: reminderService}
}

func (h *ReminderHandler) List(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	reminders, err := h.reminderService.ListByUser(user.ID.String())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to list reminders"})
	}
	return c.JSON(reminders)
}

func (h *ReminderHandler) Process(c *fiber.Ctx) error {
	count, err := h.reminderService.ProcessDueReminders()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to process due reminders"})
	}
	return c.JSON(fiber.Map{"processed": count})
}
