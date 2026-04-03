package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/upiw256/be-educore/internal/model"
	"github.com/upiw256/be-educore/internal/repo"
	"github.com/upiw256/be-educore/pkg/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type StudentHandler struct {
	repo *repo.StudentRepo
}

func NewStudentHandler() *StudentHandler {
	return &StudentHandler{
		repo: repo.NewStudentRepo(),
	}
}

func (h *StudentHandler) GetStudents(c *gin.Context) {
	search := c.Query("search")
	filter := bson.M{}
	if search != "" {
		filter["nama"] = bson.M{"$regex": search, "$options": "i"}
	}

	students, err := h.repo.FindAll(context.Background(), filter)
	if err != nil {
		utils.JSONResponse(c, http.StatusInternalServerError, "Failed to get students", nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, "Success", students)
}

type RecordHandler struct {
	izinRepo        *repo.GenericRepo
	lateRepo        *repo.GenericRepo
	pelanggaranRepo *repo.GenericRepo
}

func NewRecordHandler() *RecordHandler {
	return &RecordHandler{
		izinRepo:        repo.NewRepo("izinsiswas"),
		lateRepo:        repo.NewRepo("laterecords"),
		pelanggaranRepo: repo.NewRepo("pelanggarans"),
	}
}

func (h *RecordHandler) CreateIzin(c *gin.Context) {
	var izin model.IzinSiswa
	if err := c.ShouldBindJSON(&izin); err != nil {
		utils.JSONResponse(c, http.StatusBadRequest, "Invalid data", nil)
		return
	}
	izin.ID = primitive.NewObjectID()
	izin.CreatedAt = time.Now()
	izin.UpdatedAt = time.Now()

	if err := h.izinRepo.InsertOne(context.Background(), izin); err != nil {
		utils.JSONResponse(c, http.StatusInternalServerError, "Failed to create izin", nil)
		return
	}
	utils.JSONResponse(c, http.StatusCreated, "Izin created successfully", izin)
}

func (h *RecordHandler) CreateLateRecord(c *gin.Context) {
	var late model.LateRecord
	if err := c.ShouldBindJSON(&late); err != nil {
		utils.JSONResponse(c, http.StatusBadRequest, "Invalid data", nil)
		return
	}
	late.ID = primitive.NewObjectID()
	late.CreatedAt = time.Now()
	late.UpdatedAt = time.Now()

	if err := h.lateRepo.InsertOne(context.Background(), late); err != nil {
		utils.JSONResponse(c, http.StatusInternalServerError, "Failed to create record", nil)
		return
	}
	utils.JSONResponse(c, http.StatusCreated, "Late record created successfully", late)
}
