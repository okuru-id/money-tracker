-- Add multi-number support for bank accounts.
CREATE TABLE bank_account_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    account_number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bank_account_numbers_bank_account_id ON bank_account_numbers(bank_account_id);
CREATE INDEX idx_bank_account_numbers_family_id ON bank_account_numbers(family_id);
CREATE UNIQUE INDEX uq_bank_account_numbers_family_account_number ON bank_account_numbers(family_id, account_number);

INSERT INTO bank_account_numbers (bank_account_id, family_id, account_number, created_at, updated_at)
SELECT id, family_id, account_number, created_at, updated_at
FROM bank_accounts
WHERE account_number IS NOT NULL AND account_number != '';
