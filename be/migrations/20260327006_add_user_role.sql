-- Add role column to users table for admin functionality
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for role lookups
CREATE INDEX idx_users_role ON users(role);

-- Seed default admin user for local setup.
INSERT INTO users (email, password_hash, created_at, role)
VALUES (
    'admin@gmail.com',
    '$2y$10$a01lsDjdbMxm1/Bm.szrvebzGR/GS8frH3sgEvTRB5rvK29qbI.26',
    CURRENT_TIMESTAMP,
    'admin'
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;
