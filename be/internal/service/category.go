package service

import (
	"context"

	"money-tracker-be/internal/model"
	"money-tracker-be/internal/repository"
)

type CategoryService interface {
	GetAll(ctx context.Context) ([]model.Category, error)
	GetByType(ctx context.Context, categoryType string) ([]model.Category, error)
}

type categoryService struct {
	categoryRepo repository.CategoryRepository
}

func NewCategoryService(categoryRepo repository.CategoryRepository) CategoryService {
	return &categoryService{
		categoryRepo: categoryRepo,
	}
}

func (s *categoryService) GetAll(ctx context.Context) ([]model.Category, error) {
	return s.categoryRepo.FindAll(ctx)
}

func (s *categoryService) GetByType(ctx context.Context, categoryType string) ([]model.Category, error) {
	if categoryType != string(model.CategoryIncome) && categoryType != string(model.CategoryExpense) {
		return nil, nil
	}
	return s.categoryRepo.FindByType(ctx, categoryType)
}