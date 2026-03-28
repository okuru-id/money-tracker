-- Add bank_account_id to transactions table
ALTER TABLE transactions ADD COLUMN bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL;

-- Create index for bank account lookups
CREATE INDEX idx_transactions_bank_account_id ON transactions(bank_account_id);