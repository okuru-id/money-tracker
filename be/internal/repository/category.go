package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"money-tracker-be/internal/model"
)

type CategoryRepository interface {
	FindAll(ctx context.Context) ([]model.Category, error)
	FindByType(ctx context.Context, categoryType string) ([]model.Category, error)
	FindByID(ctx context.Context, id string) (*model.Category, error)
}

type categoryRepository struct {
	db *pgxpool.Pool
}

func NewCategoryRepository(db *pgxpool.Pool) CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) FindAll(ctx context.Context) ([]model.Category, error) {
	query := `
		SELECT id, name, type, is_default, created_at
		FROM categories
		ORDER BY is_default DESC, name ASC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []model.Category
	for rows.Next() {
		var c model.Category
		err := rows.Scan(
			&c.ID,
			&c.Name,
			&c.Type,
			&c.IsDefault,
			&c.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}
	return categories, nil
}

func (r *categoryRepository) FindByType(ctx context.Context, categoryType string) ([]model.Category, error) {
	query := `
		SELECT id, name, type, is_default, created_at
		FROM categories
		WHERE type = $1
		ORDER BY is_default DESC, name ASC
	`
	rows, err := r.db.Query(ctx, query, categoryType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []model.Category
	for rows.Next() {
		var c model.Category
		err := rows.Scan(
			&c.ID,
			&c.Name,
			&c.Type,
			&c.IsDefault,
			&c.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}
	return categories, nil
}

func (r *categoryRepository) FindByID(ctx context.Context, id string) (*model.Category, error) {
	query := `
		SELECT id, name, type, is_default, created_at
		FROM categories
		WHERE id = $1
	`
	category := &model.Category{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&category.ID,
		&category.Name,
		&category.Type,
		&category.IsDefault,
		&category.CreatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return category, nil
}