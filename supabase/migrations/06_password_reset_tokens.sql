-- Migration 06: Password Reset Tokens
-- Stores tokens for password reset functionality

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for token lookup
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);

-- Index for cleanup of expired tokens
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- Auto-delete expired tokens (optional - can also do via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM password_reset_tokens WHERE expires_at < NOW() - INTERVAL '1 day';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Run cleanup periodically when new tokens are created
CREATE TRIGGER trigger_cleanup_tokens
AFTER INSERT ON password_reset_tokens
EXECUTE FUNCTION cleanup_expired_tokens();
