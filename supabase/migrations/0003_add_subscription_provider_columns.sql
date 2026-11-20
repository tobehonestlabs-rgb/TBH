ALTER TABLE users_table
ADD COLUMN IF NOT EXISTS subscription_provider TEXT,
ADD COLUMN IF NOT EXISTS subscription_reference TEXT;