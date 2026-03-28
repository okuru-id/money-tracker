-- Seed default categories for income
INSERT INTO categories (name, type, is_default) VALUES
    ('Gaji', 'income', true),
    ('Bonus', 'income', true),
    ('Investasi', 'income', true),
    ('Hadiah', 'income', true),
    ('Lainnya', 'income', true)
ON CONFLICT DO NOTHING;

-- Seed default categories for expense
INSERT INTO categories (name, type, is_default) VALUES
    ('Makanan', 'expense', true),
    ('Transportasi', 'expense', true),
    ('Belanja', 'expense', true),
    ('Tagihan', 'expense', true),
    ('Hiburan', 'expense', true),
    ('Kesehatan', 'expense', true),
    ('Pendidikan', 'expense', true),
    ('Lainnya', 'expense', true)
ON CONFLICT DO NOTHING;