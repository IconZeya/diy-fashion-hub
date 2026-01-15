-- Migration 00: Remove foreign key constraint to auth.users
-- Run this FIRST before other migrations
-- This is needed because we're no longer using Supabase Auth

-- Drop the foreign key constraint that links profiles to auth.users
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
