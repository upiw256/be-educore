package repo

import (
	"context"

	"github.com/upiw256/be-educore/internal/model"
	"github.com/upiw256/be-educore/pkg/db"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type GenericRepo struct {
	collection *mongo.Collection
}

func NewRepo(collectionName string) *GenericRepo {
	return &GenericRepo{
		collection: db.DB.Collection(collectionName),
	}
}

func (r *GenericRepo) FindAll(ctx context.Context, filter bson.M) ([]bson.M, error) {
	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	return results, nil
}

func (r *GenericRepo) FindOne(ctx context.Context, filter bson.M) (bson.M, error) {
	var result bson.M
	err := r.collection.FindOne(ctx, filter).Decode(&result)
	return result, err
}

func (r *GenericRepo) InsertOne(ctx context.Context, doc interface{}) error {
	_, err := r.collection.InsertOne(ctx, doc)
	return err
}
