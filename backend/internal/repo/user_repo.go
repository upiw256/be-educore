package repo

import (
	"context"
	"time"

	"github.com/upiw256/be-educore/internal/model"
	"github.com/upiw256/be-educore/pkg/db"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepo struct {
	collection *mongo.Collection
}

func NewUserRepo() *UserRepo {
	return &UserRepo{
		collection: db.DB.Collection("users"),
	}
}

func (r *UserRepo) FindByUsername(ctx context.Context, username string) (*model.User, error) {
	var user model.User
	err := r.collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepo) UpdateLastLogin(ctx context.Context, id interface{}) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"updatedAt": time.Now()}})
	return err
}

func (r *UserRepo) UpdatePassword(ctx context.Context, id interface{}, password string) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"password": password}})
	return err
}
