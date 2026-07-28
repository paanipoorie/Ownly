package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"net/url"

	"github.com/gofiber/fiber/v2"
	"github.com/paanipoorie/Ownly/internal/services"
)

type AuthHandler struct {
	authService *services.AuthService
	config      struct {
		ClientID    string
		Secret      string
		RedirectURL string
		Env         string
	}
}

func NewAuthHandler(authService *services.AuthService, clientID, secret, redirectURL, env string) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		config: struct {
			ClientID    string
			Secret      string
			RedirectURL string
			Env         string
		}{
			ClientID:    clientID,
			Secret:      secret,
			RedirectURL: redirectURL,
			Env:         env,
		},
	}
}

type googleTokenResponse struct {
	AccessToken string `json:"access_token"`
	IDToken     string `json:"id_token"`
}

type googleUserInfo struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Picture string `json:"picture"`
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	url := "https://accounts.google.com/o/oauth2/v2/auth?" +
		"client_id=" + h.config.ClientID +
		"&redirect_uri=" + h.config.RedirectURL +
		"&response_type=code" +
		"&scope=openid%20email%20profile" +
		"&access_type=offline"
	return c.Redirect(url, http.StatusTemporaryRedirect)
}

func (h *AuthHandler) Callback(c *fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing code"})
	}

	tokenRes, err := h.exchangeCode(code)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "token exchange failed"})
	}

	userInfo, err := h.fetchUserInfo(tokenRes.AccessToken)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch user info"})
	}

	user, err := h.authService.FindOrCreateUser(userInfo.ID, userInfo.Email, userInfo.Name, userInfo.Picture)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create user"})
	}

	_, token, err := h.authService.CreateSession(user.ID.String())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create session"})
	}

	secure := h.config.Env == "production"
	c.Cookie(&fiber.Cookie{
		Name:     "session",
		Value:    token,
		Path:     "/",
		HTTPOnly: true,
		Secure:   secure,
		SameSite: "Lax",
		MaxAge:   7 * 24 * 60 * 60,
	})

	return c.Redirect("/", http.StatusTemporaryRedirect)
}

func (h *AuthHandler) Me(c *fiber.Ctx) error {
	user := c.Locals("user")
	return c.JSON(user)
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	token := c.Cookies("session")
	if token != "" {
		_ = h.authService.DeleteSession(token)
	}
	c.ClearCookie("session")
	return c.JSON(fiber.Map{"ok": true})
}

func (h *AuthHandler) exchangeCode(code string) (*googleTokenResponse, error) {
	tokenURL := "https://oauth2.googleapis.com/token"
	resp, err := http.PostForm(tokenURL, url.Values{
		"code":          {code},
		"client_id":     {h.config.ClientID},
		"client_secret": {h.config.Secret},
		"redirect_uri":  {h.config.RedirectURL},
		"grant_type":    {"authorization_code"},
	})
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var tokenRes googleTokenResponse
	if err := json.Unmarshal(body, &tokenRes); err != nil {
		return nil, err
	}
	return &tokenRes, nil
}

func (h *AuthHandler) fetchUserInfo(accessToken string) (*googleUserInfo, error) {
	req, _ := http.NewRequest("GET", "https://www.googleapis.com/oauth2/v1/userinfo?alt=json", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var userInfo googleUserInfo
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, err
	}
	return &userInfo, nil
}