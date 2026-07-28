package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/paanipoorie/Ownly/internal/models"
	"github.com/paanipoorie/Ownly/internal/services"
)

type ImportHandler struct {
	importService *services.ImportService
}

func NewImportHandler(importService *services.ImportService) *ImportHandler {
	return &ImportHandler{importService: importService}
}

func (h *ImportHandler) List(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	candidates, err := h.importService.GetCandidates(user.ID.String())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to list import candidates"})
	}
	return c.JSON(candidates)
}

func (h *ImportHandler) Scan(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	candidates, err := h.importService.ScanInbox(user.ID.String())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to scan inbox"})
	}
	return c.JSON(candidates)
}

func (h *ImportHandler) Confirm(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	id := c.Params("id")
	asset, err := h.importService.ConfirmCandidate(id, user.ID.String())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to confirm candidate"})
	}
	return c.JSON(asset)
}

func (h *ImportHandler) Ignore(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	id := c.Params("id")
	if err := h.importService.IgnoreCandidate(id, user.ID.String()); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to ignore candidate"})
	}
	return c.JSON(fiber.Map{"ok": true})
}
