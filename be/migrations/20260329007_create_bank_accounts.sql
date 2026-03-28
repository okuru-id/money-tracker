-- Create bank_accounts table for tracking assets per bank
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    balance DECIMAL(18, 2) NOT NULL DEFAULT 0,
    icon VARCHAR(50),
    color VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for family lookups
CREATE INDEX idx_bank_accounts_family_id ON bank_accounts(family_id);

-- Add constraint for unique bank name per family
ALTER TABLE bank_accounts ADD CONSTRAINT uq_bank_accounts_family_name UNIQUE (family_id, name);