package handler

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/upiw256/be-educore/internal/service"
	"github.com/upiw256/be-educore/pkg/utils"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{
		authService: service.NewAuthService(),
	}
}

// LoginRequest represents the user login credentials
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Login godoc
// @Summary User Login
// @Description Authenticates a user and returns a token
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Login credentials"
// @Success 200 {object} utils.APIResponse
// @Failure 400 {object} utils.APIResponse
// @Failure 401 {object} utils.APIResponse
// @Router /api/v1/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var input LoginRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		utils.JSONResponse(c, http.StatusBadRequest, "Invalid input data", nil)
		return
	}

	token, user, err := h.authService.Login(context.Background(), input.Username, input.Password)
	if err != nil {
		utils.JSONResponse(c, http.StatusUnauthorized, err.Error(), nil)
		return
	}

	utils.JSONResponse(c, http.StatusOK, "Login successful", gin.H{
		"token": token,
		"user":  user,
	})
}

type ChangePasswordRequest struct {
	Username    string `json:"username" binding:"required"`
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

// ChangePassword
// @Summary Change Password
// @Description Allows the user to change their password
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body ChangePasswordRequest true "Change Password credentials"
// @Success 200 {object} utils.APIResponse
// @Failure 400 {object} utils.APIResponse
// @Failure 401 {object} utils.APIResponse
// @Router /api/v1/auth/change-password [post]
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var input ChangePasswordRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		utils.JSONResponse(c, http.StatusBadRequest, "Invalid input data", nil)
		return
	}

	err := h.authService.ChangePassword(context.Background(), input.Username, input.OldPassword, input.NewPassword)
	if err != nil {
		utils.JSONResponse(c, http.StatusUnauthorized, err.Error(), nil)
		return
	}

	utils.JSONResponse(c, http.StatusOK, "Password successfully changed", nil)
}
