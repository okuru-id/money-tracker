-- Add foreign key constraints for transaction ownership and categorization.
-- This migration targets clean local setups, so no legacy/import seed data is created.
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

-- Require ownership fields for all future transactions.
ALTER TABLE transactions ALTER COLUMN family_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN wallet_owner_id SET NOT NULL;
