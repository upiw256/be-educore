package handler_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/upiw256/be-educore/internal/handler"
	"github.com/upiw256/be-educore/pkg/db"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/integration/mtest"
)

func setupAuthRouter(authHandler *handler.AuthHandler) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/api/v1/auth/login", authHandler.Login)
	r.POST("/api/v1/auth/change-password", authHandler.ChangePassword)
	return r
}

func TestAuthHandler(t *testing.T) {
	os.Setenv("JWT_SECRET", "test_secret")
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	mt.Run("Login success", func(mt *mtest.T) {
		db.DB = mt.Client.Database("educore_test")
		authHandler := handler.NewAuthHandler()
		router := setupAuthRouter(authHandler)

		// Use cursor ID 0 to avoid getMore/killCursors calls
		mt.AddMockResponses(mtest.CreateCursorResponse(0, "educore_test.users", mtest.FirstBatch, bson.D{
			{Key: "_id", Value: primitive.NewObjectID()},
			{Key: "username", Value: "admin"},
			{Key: "password", Value: "admin123"},
			{Key: "isActive", Value: true},
			{Key: "role", Value: "admin"},
		}))
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		loginReq := handler.LoginRequest{Username: "admin", Password: "admin123"}
		body, _ := json.Marshal(loginReq)
		req, _ := http.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	mt.Run("ChangePassword success", func(mt *mtest.T) {
		db.DB = mt.Client.Database("educore_test")
		authHandler := handler.NewAuthHandler()
		router := setupAuthRouter(authHandler)

		mt.AddMockResponses(mtest.CreateCursorResponse(0, "educore_test.users", mtest.FirstBatch, bson.D{
			{Key: "_id", Value: primitive.NewObjectID()},
			{Key: "username", Value: "admin"},
			{Key: "password", Value: "old123"},
			{Key: "isActive", Value: true},
		}))
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		changeReq := handler.ChangePasswordRequest{
			Username:    "admin",
			OldPassword: "old123",
			NewPassword: "new123",
		}
		body, _ := json.Marshal(changeReq)
		req, _ := http.NewRequest("POST", "/api/v1/auth/change-password", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code, "Response: "+w.Body.String())
	})
}
