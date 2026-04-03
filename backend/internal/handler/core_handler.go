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

// ─── Student ────────────────────────────────────────────────────────────────

type StudentHandler struct {
	repo *repo.StudentRepo
}

func NewStudentHandler() *StudentHandler {
	return &StudentHandler{repo: repo.NewStudentRepo()}
}

// GetStudents godoc
// @Summary Get all students
// @Description Retrieves a list of all students, optionally filtered by name search
// @Tags Students
// @Produce json
// @Param search query string false "Search student by name"
// @Success 200 {object} utils.APIResponse
// @Failure 500 {object} utils.APIResponse
// @Router /api/v1/students [get]
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

// ─── Records (Izin & Late) ───────────────────────────────────────────────────

type RecordHandler struct {
	izinRepo *repo.GenericRepo
	lateRepo *repo.GenericRepo
}

func NewRecordHandler() *RecordHandler {
	return &RecordHandler{
		izinRepo: repo.NewRepo("izinsiswas"),
		lateRepo: repo.NewRepo("laterecords"),
	}
}

// GetIzins godoc
// @Summary Get all Izin records
// @Description Retrieves all student excuse/absence records
// @Tags Records
// @Produce json
// @Success 200 {object} utils.APIResponse
// @Failure 500 {object} utils.APIResponse
// @Router /api/v1/izins [get]
func (h *RecordHandler) GetIzins(c *gin.Context) {
	filter := bson.M{}
	if nis := c.Query("nis"); nis != "" {
		filter["nis"] = nis
	}

	pipeline := []bson.M{
		{"$match": filter},
		{"$lookup": bson.M{
			"from":         "students",
			"localField":   "student_id",
			"foreignField": "_id",
			"as":           "student_info",
		}},
		{"$unwind": bson.M{"path": "$student_info", "preserveNullAndEmptyArrays": true}},
		// Fallback for legacy records without student_id
		{"$lookup": bson.M{
			"from":         "students",
			"localField":   "nis",
			"foreignField": "nipd",
			"as":           "legacy_student_info",
		}},
		{"$unwind": bson.M{"path": "$legacy_student_info", "preserveNullAndEmptyArrays": true}},
		{"$addFields": bson.M{
			"student_id": bson.M{"$ifNull": []interface{}{"$student_id", "$legacy_student_info._id"}},
			"name": bson.M{"$cond": bson.M{
				"if":   bson.M{"$gt": []interface{}{bson.M{"$strLenCP": bson.M{"$ifNull": []interface{}{"$student_info.nama", ""}}}, 0}},
				"then": "$student_info.nama",
				"else": bson.M{"$ifNull": []interface{}{"$legacy_student_info.nama", "$name"}},
			}},
			"className": bson.M{"$cond": bson.M{
				"if":   bson.M{"$gt": []interface{}{bson.M{"$strLenCP": bson.M{"$ifNull": []interface{}{"$student_info.nama_rombel", ""}}}, 0}},
				"then": "$student_info.nama_rombel",
				"else": bson.M{"$ifNull": []interface{}{"$legacy_student_info.nama_rombel", "$className"}},
			}},
		}},
	}

	results, err := h.izinRepo.Aggregate(context.Background(), pipeline)
	if err != nil {
		utils.JSONResponse(c, http.StatusInternalServerError, "Failed to get izin records", nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, "Success", results)
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

func (h *RecordHandler) GetLateRecords(c *gin.Context) {
	filter := bson.M{}
	if nipd := c.Query("nipd"); nipd != "" {
		filter["nipd"] = nipd
	}

	pipeline := []bson.M{
		{"$match": filter},
		{"$lookup": bson.M{
			"from":         "students",
			"localField":   "student_id",
			"foreignField": "_id",
			"as":           "student_info",
		}},
		{"$unwind": bson.M{"path": "$student_info", "preserveNullAndEmptyArrays": true}},
		// Fallback for legacy records without student_id
		{"$lookup": bson.M{
			"from":         "students",
			"localField":   "nipd",
			"foreignField": "nipd",
			"as":           "legacy_student_info",
		}},
		{"$unwind": bson.M{"path": "$legacy_student_info", "preserveNullAndEmptyArrays": true}},
		{"$addFields": bson.M{
			"student_id": bson.M{"$ifNull": []interface{}{"$student_id", "$legacy_student_info._id"}},
			"name": bson.M{"$cond": bson.M{
				"if":   bson.M{"$gt": []interface{}{bson.M{"$strLenCP": bson.M{"$ifNull": []interface{}{"$student_info.nama", ""}}}, 0}},
				"then": "$student_info.nama",
				"else": bson.M{"$ifNull": []interface{}{"$legacy_student_info.nama", "$name"}},
			}},
			"className": bson.M{"$cond": bson.M{
				"if":   bson.M{"$gt": []interface{}{bson.M{"$strLenCP": bson.M{"$ifNull": []interface{}{"$student_info.nama_rombel", ""}}}, 0}},
				"then": "$student_info.nama_rombel",
				"else": bson.M{"$ifNull": []interface{}{"$legacy_student_info.nama_rombel", "$className"}},
			}},
		}},
	}

	results, err := h.lateRepo.Aggregate(context.Background(), pipeline)
	if err != nil {
		utils.JSONResponse(c, http.StatusInternalServerError, "Failed to get late records", nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, "Success", results)
}

// CreateLateRecord godoc
// @Summary Create a Late record
// @Description Record a student's lateness
// @Tags Records
// @Accept json
// @Produce json
// @Param request body model.LateRecord true "Late record details"
// @Success 201 {object} utils.APIResponse
// @Failure 400 {object} utils.APIResponse
// @Failure 500 {object} utils.APIResponse
// @Router /api/v1/late-records [post]
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

// ─── Pelanggaran ─────────────────────────────────────────────────────────────

type PelanggaranHandler struct {
	repo *repo.GenericRepo
}

func NewPelanggaranHandler() *PelanggaranHandler {
	return &PelanggaranHandler{repo: repo.NewRepo("pelanggarans")}
}

// GetPelanggarans godoc
// @Summary Get all Pelanggaran records
// @Description Retrieves all discipline/violation records
// @Tags Pelanggaran
// @Produce json
// @Success 200 {object} utils.APIResponse
// @Failure 500 {object} utils.APIResponse
// @Router /api/v1/pelanggarans [get]
func (h *PelanggaranHandler) GetPelanggarans(c *gin.Context) {
	results, err := h.repo.FindAll(context.Background(), bson.M{})
	if err != nil {
		utils.JSONResponse(c, http.StatusInternalServerError, "Failed to get pelanggaran records", nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, "Success", results)
}

// CreatePelanggaran godoc
// @Summary Create a Pelanggaran record
// @Description Record a student's discipline violation
// @Tags Pelanggaran
// @Accept json
// @Produce json
// @Param request body model.Pelanggaran true "Pelanggaran details"
// @Success 201 {object} utils.APIResponse
// @Failure 400 {object} utils.APIResponse
// @Failure 500 {object} utils.APIResponse
// @Router /api/v1/pelanggarans [post]
func (h *PelanggaranHandler) CreatePelanggaran(c *gin.Context) {
	var p model.Pelanggaran
	if err := c.ShouldBindJSON(&p); err != nil {
		utils.JSONResponse(c, http.StatusBadRequest, "Invalid data", nil)
		return
	}
	p.ID = primitive.NewObjectID()
	p.Date = time.Now()
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()
	if err := h.repo.InsertOne(context.Background(), p); err != nil {
		utils.JSONResponse(c, http.StatusInternalServerError, "Failed to create pelanggaran", nil)
		return
	}
	utils.JSONResponse(c, http.StatusCreated, "Pelanggaran created successfully", p)
}

// ─── Schedule ────────────────────────────────────────────────────────────────

type ScheduleHandler struct {
	repo *repo.GenericRepo
}

func NewScheduleHandler() *ScheduleHandler {
	return &ScheduleHandler{repo: repo.NewRepo("schedules")}
}

// GetSchedules godoc
// @Summary Get all Schedules
// @Description Retrieves all class schedules
// @Tags Schedule
// @Produce json
// @Param rombel query string false "Filter by rombel/class"
// @Param day    query string false "Filter by day"
// @Success 200 {object} utils.APIResponse
// @Failure 500 {object} utils.APIResponse
// @Router /api/v1/schedules [get]
func (h *ScheduleHandler) GetSchedules(c *gin.Context) {
	filter := bson.M{}
	if rombel := c.Query("rombel"); rombel != "" {
		filter["rombel"] = rombel
	}
	if day := c.Query("day"); day != "" {
		filter["day"] = day
	}
	results, err := h.repo.FindAll(context.Background(), filter)
	if err != nil {
		utils.JSONResponse(c, http.StatusInternalServerError, "Failed to get schedules", nil)
		return
	}
	utils.JSONResponse(c, http.StatusOK, "Success", results)
}
