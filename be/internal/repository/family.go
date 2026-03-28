package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"money-tracker-be/internal/model"
)

type FamilyRepository interface {
	Create(ctx context.Context, family *model.Family) error
	FindByID(ctx context.Context, id string) (*model.Family, error)
	AddMember(ctx context.Context, member *model.FamilyMember) error
	FindMembers(ctx context.Context, familyID string) ([]model.FamilyMemberResponse, error)
	FindMemberByUserID(ctx context.Context, familyID, userID string) (*model.FamilyMember, error)
	FindFamiliesByUserID(ctx context.Context, userID string) ([]model.FamilyMember, error)
	IsOwner(ctx context.Context, familyID, userID string) (bool, error)
	ListAll(ctx context.Context, limit, offset int) ([]model.FamilyListItem, error)
	Count(ctx context.Context) (int64, error)
	CountByCreator(ctx context.Context, userID string) (int64, error)
	RemoveMember(ctx context.Context, familyID, userID string) error
	Update(ctx context.Context, familyID string, name string) error
	Delete(ctx context.Context, familyID string) error
	TransferOwnership(ctx context.Context, familyID, newOwnerID string) error
}

type familyRepository struct {
	db *pgxpool.Pool
}

func NewFamilyRepository(db *pgxpool.Pool) FamilyRepository {
	return &familyRepository{db: db}
}

func (r *familyRepository) Create(ctx context.Context, family *model.Family) error {
	query := `
		INSERT INTO families (id, name, created_by, created_at)
		VALUES ($1, $2, $3, $4)
	`
	_, err := r.db.Exec(ctx, query,
		family.ID,
		family.Name,
		family.CreatedBy,
		family.CreatedAt,
	)
	return err
}

func (r *familyRepository) FindByID(ctx context.Context, id string) (*model.Family, error) {
	query := `
		SELECT id, name, created_by, created_at
		FROM families
		WHERE id = $1
	`
	family := &model.Family{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&family.ID,
		&family.Name,
		&family.CreatedBy,
		&family.CreatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return family, nil
}

func (r *familyRepository) AddMember(ctx context.Context, member *model.FamilyMember) error {
	query := `
		INSERT INTO family_members (id, family_id, user_id, role, joined_at)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.Exec(ctx, query,
		member.ID,
		member.FamilyID,
		member.UserID,
		member.Role,
		member.JoinedAt,
	)
	return err
}

func (r *familyRepository) FindMembers(ctx context.Context, familyID string) ([]model.FamilyMemberResponse, error) {
	query := `
		SELECT fm.id, fm.user_id, u.email, u.email as name, fm.role, fm.joined_at
		FROM family_members fm
		JOIN users u ON fm.user_id = u.id
		WHERE fm.family_id = $1
		ORDER BY fm.role = 'owner' DESC, fm.joined_at ASC
	`
	rows, err := r.db.Query(ctx, query, familyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []model.FamilyMemberResponse
	for rows.Next() {
		var m model.FamilyMemberResponse
		err := rows.Scan(
			&m.ID,
			&m.UserID,
			&m.Email,
			&m.Name,
			&m.Role,
			&m.JoinedAt,
		)
		if err != nil {
			return nil, err
		}
		members = append(members, m)
	}
	return members, nil
}

func (r *familyRepository) FindMemberByUserID(ctx context.Context, familyID, userID string) (*model.FamilyMember, error) {
	query := `
		SELECT id, family_id, user_id, role, joined_at
		FROM family_members
		WHERE family_id = $1 AND user_id = $2
	`
	member := &model.FamilyMember{}
	err := r.db.QueryRow(ctx, query, familyID, userID).Scan(
		&member.ID,
		&member.FamilyID,
		&member.UserID,
		&member.Role,
		&member.JoinedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return member, nil
}

func (r *familyRepository) FindFamiliesByUserID(ctx context.Context, userID string) ([]model.FamilyMember, error) {
	query := `
		SELECT id, family_id, user_id, role, joined_at
		FROM family_members
		WHERE user_id = $1
		ORDER BY joined_at ASC
	`
	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []model.FamilyMember
	for rows.Next() {
		var m model.FamilyMember
		err := rows.Scan(
			&m.ID,
			&m.FamilyID,
			&m.UserID,
			&m.Role,
			&m.JoinedAt,
		)
		if err != nil {
			return nil, err
		}
		members = append(members, m)
	}
	return members, nil
}

func (r *familyRepository) IsOwner(ctx context.Context, familyID, userID string) (bool, error) {
	query := `
		SELECT role FROM family_members
		WHERE family_id = $1 AND user_id = $2
	`
	var role string
	err := r.db.QueryRow(ctx, query, familyID, userID).Scan(&role)
	if err != nil {
		if err == pgx.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	return role == string(model.RoleOwner), nil
}

func (r *familyRepository) ListAll(ctx context.Context, limit, offset int) ([]model.FamilyListItem, error) {
	query := `
		SELECT f.id, f.name, f.created_by, f.created_at, COALESCE(u.email, '') as created_by_name
		FROM families f
		LEFT JOIN users u ON f.created_by = u.id
		ORDER BY f.created_at DESC
		LIMIT $1 OFFSET $2
	`
	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var families []model.FamilyListItem
	for rows.Next() {
		var f model.FamilyListItem
		if err := rows.Scan(
			&f.ID,
			&f.Name,
			&f.CreatedBy,
			&f.CreatedAt,
			&f.CreatedByName,
		); err != nil {
			return nil, err
		}
		families = append(families, f)
	}
	return families, nil
}

func (r *familyRepository) Count(ctx context.Context) (int64, error) {
	query := `SELECT COUNT(*) FROM families`
	var count int64
	err := r.db.QueryRow(ctx, query).Scan(&count)
	return count, err
}

func (r *familyRepository) CountByCreator(ctx context.Context, userID string) (int64, error) {
	query := `SELECT COUNT(*) FROM families WHERE created_by = $1`
	var count int64
	err := r.db.QueryRow(ctx, query, userID).Scan(&count)
	return count, err
}

func (r *familyRepository) RemoveMember(ctx context.Context, familyID, userID string) error {
	query := `DELETE FROM family_members WHERE family_id = $1 AND user_id = $2`
	_, err := r.db.Exec(ctx, query, familyID, userID)
	return err
}

func (r *familyRepository) Update(ctx context.Context, familyID string, name string) error {
	query := `UPDATE families SET name = $1 WHERE id = $2`
	_, err := r.db.Exec(ctx, query, name, familyID)
	return err
}

func (r *familyRepository) Delete(ctx context.Context, familyID string) error {
	// Delete members first
	_, err := r.db.Exec(ctx, `DELETE FROM family_members WHERE family_id = $1`, familyID)
	if err != nil {
		return err
	}

	// Delete family
	query := `DELETE FROM families WHERE id = $1`
	_, err = r.db.Exec(ctx, query, familyID)
	return err
}

func (r *familyRepository) TransferOwnership(ctx context.Context, familyID, newOwnerID string) error {
	// First, set current owner role to 'member'
	query := `
		UPDATE family_members
		SET role = 'member'
		WHERE family_id = $1 AND role = 'owner'
	`
	_, err := r.db.Exec(ctx, query, familyID)
	if err != nil {
		return err
	}

	// Then, set new owner role to 'owner'
	query = `
		UPDATE family_members
		SET role = 'owner'
		WHERE family_id = $1 AND user_id = $2
	`
	_, err = r.db.Exec(ctx, query, familyID, newOwnerID)
	return err
}