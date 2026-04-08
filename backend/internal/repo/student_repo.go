package repo

import (
	"context"

	"github.com/upiw256/be-educore/internal/model"
	"github.com/upiw256/be-educore/pkg/db"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type StudentRepo struct {
	collection *mongo.Collection
}

func NewStudentRepo() *StudentRepo {
	return &StudentRepo{
		collection: db.DB.Collection("students"),
	}
}

func (r *StudentRepo) FindAll(ctx context.Context, filter bson.M) ([]model.Student, error) {
	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var students []model.Student
	if err = cursor.All(ctx, &students); err != nil {
		return nil, err
	}
	return students, nil
}

func (r *StudentRepo) FindByNIPD(ctx context.Context, nipd string) (*model.Student, error) {
	var student model.Student
	err := r.collection.FindOne(ctx, bson.M{"nipd": nipd}).Decode(&student)
	if err != nil {
		return nil, err
	}
	return &student, nil
}
func (r *StudentRepo) GetDistinctRombels(ctx context.Context) ([]string, error) {
	results, err := r.collection.Distinct(ctx, "nama_rombel", bson.M{"is_active": true})
	if err != nil {
		return nil, err
	}
	rombels := make([]string, len(results))
	for i, v := range results {
		rombels[i] = v.(string)
	}
	return rombels, nil
}
