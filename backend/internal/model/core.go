package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Student struct {
	ID             primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	PesertaDidikID string             `json:"peserta_didik_id" bson:"peserta_didik_id"`
	Nama           string             `json:"nama" bson:"nama"`
	NamaRombel     string             `json:"nama_rombel" bson:"nama_rombel"`
	NIPD           string             `json:"nipd" bson:"nipd"`
	NISN           string             `json:"nisn" bson:"nisn"`
	Points         int                `json:"points" bson:"points"`
	IsActive       bool               `json:"is_active" bson:"is_active"`
	CreatedAt      time.Time          `json:"created_at" bson:"createdAt"`
	UpdatedAt      time.Time          `json:"updated_at" bson:"updatedAt"`
}

type Teacher struct {
	ID                  primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	PTKID               string             `json:"ptk_id" bson:"ptk_id"`
	Nama                string             `json:"nama" bson:"nama"`
	NIP                 string             `json:"nip" bson:"nip"`
	NUPTK               string             `json:"nuptk" bson:"nuptk"`
	JabatanPTKIDStr     string             `json:"jabatan_ptk_id_str" bson:"jabatan_ptk_id_str"`
	JenisPTKIDStr       string             `json:"jenis_ptk_id_str" bson:"jenis_ptk_id_str"`
	StatusKepegawaianID string             `json:"status_kepegawaian_id_str" bson:"status_kepegawaian_id_str"`
	TempatLahir         string             `json:"tempat_lahir" bson:"tempat_lahir"`
	TanggalLahir        string             `json:"tanggal_lahir" bson:"tanggal_lahir"`
	CreatedAt           time.Time          `json:"created_at" bson:"createdAt"`
	UpdatedAt           time.Time          `json:"updated_at" bson:"updatedAt"`
}

type Schedule struct {
	ID           primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Day          string             `json:"day" bson:"day"`
	Period       int                `json:"period" bson:"period"`
	TimeRange    string             `json:"timeRange" bson:"timeRange"`
	Rombel       string             `json:"rombel" bson:"rombel"`
	TeacherName  string             `json:"teacherName" bson:"teacherName"`
	Subject      string             `json:"subject" bson:"subject"`
	AcademicYear string             `json:"academicYear" bson:"academicYear"`
	Semester     string             `json:"semester" bson:"semester"`
	CreatedAt    time.Time          `json:"created_at" bson:"createdAt"`
	UpdatedAt    time.Time          `json:"updated_at" bson:"updatedAt"`
}

type IzinSiswa struct {
	ID         primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	StudentID  primitive.ObjectID `json:"student_id" bson:"student_id"`
	NIS        string             `json:"nis" bson:"nis"`
	Name       string             `json:"name" bson:"name"`
	ClassName  string             `json:"className" bson:"className"`
	Type       string             `json:"type" bson:"type"`
	Reason     string             `json:"reason" bson:"reason"`
	Time       time.Time          `json:"time" bson:"time"`
	RecordedBy string             `json:"recorded_by" bson:"recorded_by"`
	CreatedAt  time.Time          `json:"created_at" bson:"createdAt"`
	UpdatedAt  time.Time          `json:"updated_at" bson:"updatedAt"`
}
