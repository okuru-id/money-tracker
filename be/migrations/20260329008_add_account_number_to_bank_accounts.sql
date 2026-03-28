-- Add account_number to bank_accounts table
ALTER TABLE bank_accounts ADD COLUMN account_number VARCHAR(50) NOT NULL DEFAULT '';

-- Create index for account_number lookups
CREATE INDEX idx_bank_accounts_account_number ON bank_accounts(account_number);

-- Create unique constraint for account_number per family
CREATE UNIQUE INDEX idx_bank_accounts_family_account_number ON bank_accounts(family_id, account_number) WHERE account_number != '';