-- Add subscription-related columns to users_table
ALTER TABLE users_table
ADD COLUMN IF NOT EXISTS active_subscription BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_code TEXT,
ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMP WITH TIME ZONE;
