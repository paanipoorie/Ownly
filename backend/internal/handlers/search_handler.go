package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/paanipoorie/Ownly/internal/models"
	"github.com/paanipoorie/Ownly/internal/services"
)

type SearchHandler struct {
	searchService *services.SearchService
}

func NewSearchHandler(searchService *services.SearchService) *SearchHandler {
	return &SearchHandler{searchService: searchService}
}

func (h *SearchHandler) Search(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	query := c.Query("q")
	category := c.Query("category")

	assets, err := h.searchService.Search(user.ID.String(), query, category)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to search assets"})
	}
	return c.JSON(assets)
}
