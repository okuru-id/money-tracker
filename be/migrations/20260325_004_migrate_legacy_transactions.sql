-- Create system user for legacy transactions
INSERT INTO users (id, email, password_hash, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'system@money-tracker.local',
    '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Create "Imported Transactions" family
INSERT INTO families (id, name, created_by, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Imported Transactions',
    '00000000-0000-0000-0000-000000000001',
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- Add system user as owner of the Imported family
INSERT INTO family_members (family_id, user_id, role, joined_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'owner',
    CURRENT_TIMESTAMP
) ON CONFLICT (family_id, user_id) DO NOTHING;

-- Migrate existing transactions to the Imported family
-- Only update rows that don't have family_id set yet
UPDATE transactions
SET
    family_id = '00000000-0000-0000-0000-000000000001',
    wallet_owner_id = '00000000-0000-0000-0000-000000000001',
    created_by = '00000000-0000-0000-0000-000000000001',
    updated_at = CURRENT_TIMESTAMP
WHERE family_id IS NULL;

-- Add foreign key constraints after data migration
ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_family_id
    FOREIGN KEY (family_id) REFERENCES families(id);

ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_wallet_owner_id
    FOREIGN KEY (wallet_owner_id) REFERENCES users(id);

ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_category_id
    FOREIGN KEY (category_id) REFERENCES categories(id);

ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_created_by
    FOREIGN KEY (created_by) REFERENCES users(id);

-- Make family_id and wallet_owner_id NOT NULL after migration
ALTER TABLE transactions ALTER COLUMN family_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN wallet_owner_id SET NOT NULL;

-- Add check to ensure note is used for new transactions
-- Legacy transactions may have NULL note, which is fine