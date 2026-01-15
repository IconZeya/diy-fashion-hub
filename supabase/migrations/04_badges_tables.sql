-- Migration 04: Badges System
-- Creates tables for skill badges and user achievements

-- Badge definitions table
CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('milestone', 'category', 'community')),
  requirement JSONB NOT NULL
);

-- User earned badges table
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Index for efficient queries
CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- Seed initial badges
INSERT INTO badges (id, name, description, icon, category, requirement) VALUES
-- Milestone badges
('first_pin', 'First Creation', 'Created your first pin', 'seedling', 'milestone', '{"pins": 1}'),
('five_pins', 'Getting Started', 'Created 5 pins', 'flame', 'milestone', '{"pins": 5}'),
('ten_pins', 'Prolific Creator', 'Created 10 pins', 'palette', 'milestone', '{"pins": 10}'),
('twentyfive_pins', 'Master Crafter', 'Created 25 pins', 'crown', 'milestone', '{"pins": 25}'),
('first_follower', 'Rising Star', 'Gained your first follower', 'star', 'milestone', '{"followers": 1}'),
('ten_followers', 'Influencer', 'Gained 10 followers', 'sparkles', 'milestone', '{"followers": 10}'),
('fifty_followers', 'Trendsetter', 'Gained 50 followers', 'trophy', 'milestone', '{"followers": 50}'),

-- Category expertise badges
('upcycling_expert', 'Upcycling Expert', 'Created 5 upcycling pins', 'recycle', 'category', '{"category": "upcycling", "pins": 5}'),
('embroidery_expert', 'Embroidery Expert', 'Created 5 embroidery pins', 'flower', 'category', '{"category": "embroidery", "pins": 5}'),
('tiedye_expert', 'Tie-Dye Expert', 'Created 5 tie-dye pins', 'rainbow', 'category', '{"category": "tie-dye", "pins": 5}'),
('sewing_expert', 'Sewing Expert', 'Created 5 sewing pins', 'scissors', 'category', '{"category": "sewing", "pins": 5}'),
('knitting_expert', 'Knitting Expert', 'Created 5 knitting pins', 'heart', 'category', '{"category": "knitting", "pins": 5}'),

-- Community badges
('helpful', 'Helpful', 'Left 10 comments on others pins', 'message-circle', 'community', '{"comments": 10}'),
('super_helpful', 'Super Helpful', 'Left 50 comments on others pins', 'messages-square', 'community', '{"comments": 50}'),
('curator', 'Curator', 'Saved 20 pins to boards', 'bookmark', 'community', '{"saved": 20}'),
('super_curator', 'Super Curator', 'Saved 50 pins to boards', 'library', 'community', '{"saved": 50}'),
('popular', 'Popular', 'Received 50 likes on your pins', 'heart', 'community', '{"likes_received": 50}'),
('viral', 'Viral', 'Received 200 likes on your pins', 'zap', 'community', '{"likes_received": 200}');
