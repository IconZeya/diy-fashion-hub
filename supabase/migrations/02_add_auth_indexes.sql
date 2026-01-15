-- Migration 02: Add indexes for auth columns
-- Run this after migration 01

-- Index for email lookups (login)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Index for Google ID lookups (Google OAuth)
CREATE INDEX IF NOT EXISTS idx_profiles_google_id ON profiles(google_id);
