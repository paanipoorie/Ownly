package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/paanipoorie/Ownly/internal/models"
	"github.com/paanipoorie/Ownly/internal/services"
)

type AssetHandler struct {
	assetService *services.AssetService
}

func NewAssetHandler(assetService *services.AssetService) *AssetHandler {
	return &AssetHandler{assetService: assetService}
}

func (h *AssetHandler) List(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	assets, err := h.assetService.ListByUser(user.ID.String())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to list assets"})
	}
	return c.JSON(assets)
}

func (h *AssetHandler) Get(c *fiber.Ctx) error {
	asset, err := h.assetService.GetByID(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "asset not found"})
	}
	return c.JSON(asset)
}

func (h *AssetHandler) Create(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	var asset models.Asset
	if err := c.BodyParser(&asset); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	asset.UserID = user.ID
	if err := h.assetService.Create(&asset); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create asset"})
	}
	return c.Status(fiber.StatusCreated).JSON(asset)
}

func (h *AssetHandler) Update(c *fiber.Ctx) error {
	asset, err := h.assetService.GetByID(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "asset not found"})
	}
	if err := c.BodyParser(asset); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if err := h.assetService.Update(asset); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update asset"})
	}
	return c.JSON(asset)
}

func (h *AssetHandler) Delete(c *fiber.Ctx) error {
	if err := h.assetService.Delete(c.Params("id")); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "asset not found"})
	}
	return c.JSON(fiber.Map{"ok": true})
}