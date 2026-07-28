package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/paanipoorie/Ownly/internal/models"
	"github.com/paanipoorie/Ownly/internal/services"
)

type TimelineHandler struct {
	timelineService *services.TimelineService
}

func NewTimelineHandler(timelineService *services.TimelineService) *TimelineHandler {
	return &TimelineHandler{timelineService: timelineService}
}

func (h *TimelineHandler) List(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	events, err := h.timelineService.ListByUser(user.ID.String())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to list timeline events"})
	}
	return c.JSON(events)
}
