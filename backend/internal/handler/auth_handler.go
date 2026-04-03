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

func (h *AuthHandler) Login(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

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
