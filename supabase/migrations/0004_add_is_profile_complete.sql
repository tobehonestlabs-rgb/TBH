-- Migration 0004: Add is_profile_complete column to users_table
-- Allows support for Ghost / Partial users created on the web
ALTER TABLE users_table
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT TRUE;

-- Allow nullable profile columns for ghost users
ALTER TABLE users_table ALTER COLUMN username DROP NOT NULL;
ALTER TABLE users_table ALTER COLUMN slug DROP NOT NULL;
ALTER TABLE users_table ALTER COLUMN birthdate DROP NOT NULL;

-- Ensure all existing users are marked as complete
UPDATE users_table
SET is_profile_complete = TRUE
WHERE is_profile_complete IS NULL;
