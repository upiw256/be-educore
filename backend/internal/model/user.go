package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Username    string             `json:"username" bson:"username"`
	Password    string             `json:"-" bson:"password"`
	Role        string             `json:"role" bson:"role"`
	IsActive    bool               `json:"is_active" bson:"isActive"`
	TeacherID   primitive.ObjectID `json:"teacher_id,omitempty" bson:"teacherId,omitempty"`
	TeacherName string             `json:"teacher_name,omitempty" bson:"-"`
	CreatedAt   time.Time          `json:"created_at" bson:"createdAt"`
	UpdatedAt   time.Time          `json:"updated_at" bson:"updatedAt"`
}
