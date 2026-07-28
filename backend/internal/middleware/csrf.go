package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

func CSRFMiddleware(allowedOrigins ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		method := c.Method()
		if method == "GET" || method == "HEAD" || method == "OPTIONS" {
			return c.Next()
		}

		origin := c.Get("Origin")
		referer := c.Get("Referer")

		allowed := false
		for _, ao := range allowedOrigins {
			if origin != "" && strings.HasPrefix(origin, ao) {
				allowed = true
				break
			}
			if referer != "" && strings.HasPrefix(referer, ao) {
				allowed = true
				break
			}
		}

		if !allowed {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "invalid origin"})
		}

		return c.Next()
	}
}
