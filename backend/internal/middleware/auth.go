package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/paanipoorie/Ownly/internal/services"
)

func AuthMiddleware(authService *services.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		token := c.Cookies("session")
		if token == "" {
			token = c.Get("Authorization")
			if len(token) > 7 && token[:7] == "Bearer " {
				token = token[7:]
			} else {
				token = ""
			}
		}

		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		user, err := authService.ValidateSession(token)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid session"})
		}

		c.Locals("user", user)
		return c.Next()
	}
}