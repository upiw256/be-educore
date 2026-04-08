package handler_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/upiw256/be-educore/internal/handler"
	"github.com/upiw256/be-educore/internal/model"
	"github.com/upiw256/be-educore/pkg/db"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/integration/mtest"
)

func setupCoreRouter() (*gin.Engine) {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	sh := handler.NewStudentHandler()
	rh := handler.NewRecordHandler()
	ph := handler.NewPelanggaranHandler()
	
	r.GET("/api/v1/students", sh.GetStudents)
	r.POST("/api/v1/izins", rh.CreateIzin)
	r.GET("/api/v1/pelanggarans", ph.GetPelanggarans)
	
	return r
}

func TestCoreHandlers(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	mt.Run("GetStudents Success", func(mt *mtest.T) {
		db.DB = mt.Client.Database("educore_test")
		router := setupCoreRouter()

		resDoc := bson.D{
			{Key: "_id", Value: primitive.NewObjectID()},
			{Key: "nama", Value: "Andi"},
			{Key: "nipd", Value: "123"},
		}

		// Cursor ID 0 avoids extra driver commands
		mt.AddMockResponses(mtest.CreateCursorResponse(0, "educore_test.students", mtest.FirstBatch, resDoc))

		req, _ := http.NewRequest("GET", "/api/v1/students", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code, "Response: "+w.Body.String())
		assert.Contains(t, w.Body.String(), "Andi")
	})

	mt.Run("CreateIzin Success", func(mt *mtest.T) {
		db.DB = mt.Client.Database("educore_test")
		router := setupCoreRouter()

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		izinReq := model.IzinSiswa{
			NIS: "123",
			Reason: "Sakit",
		}
		body, _ := json.Marshal(izinReq)
		req, _ := http.NewRequest("POST", "/api/v1/izins", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code, "Response: "+w.Body.String())
	})

	mt.Run("GetPelanggarans Aggregate Success", func(mt *mtest.T) {
		db.DB = mt.Client.Database("educore_test")
		router := setupCoreRouter()

		resDoc := bson.D{
			{Key: "name", Value: "Andi"},
			{Key: "violation", Value: "Late"},
		}

		mt.AddMockResponses(mtest.CreateCursorResponse(0, "educore_test.pelanggarans", mtest.FirstBatch, resDoc))

		req, _ := http.NewRequest("GET", "/api/v1/pelanggarans", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code, "Response: "+w.Body.String())
		assert.Contains(t, w.Body.String(), "Andi")
	})
}
