-- Create failed_parses table for storing emails that failed to parse
CREATE TABLE IF NOT EXISTS failed_parses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id VARCHAR(255),
    raw_email TEXT,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for failed_parses
CREATE INDEX IF NOT EXISTS idx_failed_parses_message_id ON failed_parses(message_id);
CREATE INDEX IF NOT EXISTS idx_failed_parses_created_at ON failed_parses(created_at);