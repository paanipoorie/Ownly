package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/paanipoorie/Ownly/internal/models"
	"github.com/paanipoorie/Ownly/internal/services"
)

type SeedHandler struct {
	seedService *services.SeedService
}

func NewSeedHandler(seedService *services.SeedService) *SeedHandler {
	return &SeedHandler{seedService: seedService}
}

func (h *SeedHandler) SeedDemo(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	counts, err := h.seedService.SeedDemo(user.ID.String())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to seed demo data: " + err.Error()})
	}
	return c.JSON(fiber.Map{
		"ok":     true,
		"seeded": counts,
	})
}
