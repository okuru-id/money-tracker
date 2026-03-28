-- Add role column to users table for admin functionality
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for role lookups
CREATE INDEX idx_users_role ON users(role);