-- Add new columns to transactions table
-- First, check if transactions table exists and has the expected structure

-- Add family_id column (nullable first for migration)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS family_id UUID;

-- Add wallet_owner_id column
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS wallet_owner_id UUID;

-- Add category_id column
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category_id UUID;

-- Add note column
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS note TEXT;

-- Add created_by column
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by UUID;

-- Add updated_at column
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Add new id column as UUID
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS new_id UUID DEFAULT gen_random_uuid();

-- Create new transactions table with proper UUID primary key
-- This approach preserves existing data while restructuring

-- Step 1: Populate new_id for existing rows
UPDATE transactions SET new_id = gen_random_uuid() WHERE new_id IS NULL;

-- Step 2: Make new_id NOT NULL
ALTER TABLE transactions ALTER COLUMN new_id SET NOT NULL;

-- Step 3: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_transactions_family_id ON transactions(family_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_owner_id ON transactions(wallet_owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date);