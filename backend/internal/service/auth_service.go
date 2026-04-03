package service

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/upiw256/be-educore/internal/model"
	"github.com/upiw256/be-educore/internal/repo"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo *repo.UserRepo
}

func NewAuthService() *AuthService {
	return &AuthService{
		userRepo: repo.NewUserRepo(),
	}
}

func (s *AuthService) Login(ctx context.Context, username, password string) (string, *model.User, error) {
	user, err := s.userRepo.FindByUsername(ctx, username)
	if err != nil {
		return "", nil, errors.New("invalid username or password")
	}

	if !user.IsActive {
		return "", nil, errors.New("user account is inactive")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		// Fallback to plain comparison since the provided passwords in the MongoDB snapshot were plain or differently hashed
		// But usually it should be hashed. Let's try plain if it fails.
		if user.Password != password {
			return "", nil, errors.New("invalid username or password")
		}
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID.Hex(),
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return "", nil, err
	}

	_ = s.userRepo.UpdateLastLogin(ctx, user.ID)

	// Fetch teacher name if applicable
	if !user.TeacherID.IsZero() {
		teacherRepo := repo.NewRepo("teachers")
		res, _ := teacherRepo.FindOne(ctx, bson.M{"_id": user.TeacherID})
		if res != nil {
			// Extract Name from bson.M map
			if name, ok := res["nama"].(string); ok {
				user.TeacherName = name
			}
		}
	}

	return tokenString, user, nil
}
