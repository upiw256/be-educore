package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type LateRecord struct {
	ID           primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	StudentID    primitive.ObjectID `json:"student_id" bson:"student_id"`
	NIPD         string             `json:"nipd" bson:"nipd"`
	Name         string             `json:"name" bson:"name"`
	ClassName    string             `json:"className" bson:"className"`
	ArrivalTime  time.Time          `json:"arrival_time" bson:"arrival_time"`
	Reason       string             `json:"reason" bson:"reason"`
	AcademicYear string             `json:"academic_year" bson:"academic_year"`
	Semester     int                `json:"semester" bson:"semester"`
	RecordedBy   string             `json:"recorded_by" bson:"recorded_by"`
	CreatedAt    time.Time          `json:"created_at" bson:"createdAt"`
	UpdatedAt    time.Time          `json:"updated_at" bson:"updatedAt"`
}

type Pelanggaran struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	NIS         string             `json:"nis" bson:"nis"`
	Type        string             `json:"type" bson:"type"`
	Poin        int                `json:"poin" bson:"poin"`
	Description string             `json:"description" bson:"description"`
	Date        time.Time          `json:"date" bson:"date"`
	CreatedAt   time.Time          `json:"created_at" bson:"createdAt"`
	UpdatedAt   time.Time          `json:"updated_at" bson:"updatedAt"`
}

type Sekolah struct {
	ID            primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	SekolahID     string             `json:"sekolah_id" bson:"sekolah_id"`
	Nama          string             `json:"nama" bson:"nama"`
	NPSN          string             `json:"npsn" bson:"npsn"`
	Alamat        string             `json:"alamat" bson:"alamat"`
	Email         string             `json:"email" bson:"email"`
	Telepon       string             `json:"telepon" bson:"telepon"`
	KabupatenKota string             `json:"kabupaten_kota" bson:"kabupaten_kota"`
	Provinsi      string             `json:"provinsi" bson:"provinsi"`
	LastSync      time.Time          `json:"last_sync" bson:"last_sync"`
	CreatedAt     time.Time          `json:"created_at" bson:"createdAt"`
	UpdatedAt     time.Time          `json:"updated_at" bson:"updatedAt"`
}
