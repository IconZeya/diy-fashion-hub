-- Migration 01: Add authentication columns to profiles table
-- Run this first

-- Add email column (for email/password auth)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Add password hash column (for email/password auth)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add auth provider column (email, google)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';

-- Add Google ID column (for Google OAuth)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
