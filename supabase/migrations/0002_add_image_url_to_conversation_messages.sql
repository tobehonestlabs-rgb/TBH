-- Add image_url column to conversation_messages table
ALTER TABLE conversation_messages
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Make content field nullable to allow messages with only images/GIFs
ALTER TABLE conversation_messages
ALTER COLUMN content DROP NOT NULL;

-- Set default empty string for existing records
UPDATE conversation_messages
SET content = ''
WHERE content IS NULL;

-- Set default value for future inserts
ALTER TABLE conversation_messages
ALTER COLUMN content SET DEFAULT '';
