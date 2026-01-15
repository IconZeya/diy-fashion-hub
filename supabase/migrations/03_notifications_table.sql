-- Migration 03: Notifications Table
-- This creates the notifications system for likes, follows, comments, and saves

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'follow', 'comment', 'save')),
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pin_id UUID REFERENCES pins(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries by user
CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);

-- Index for cleanup of old notifications
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Prevent duplicate notifications (same actor, type, and target within short time)
CREATE UNIQUE INDEX idx_notifications_unique ON notifications(user_id, actor_id, type, COALESCE(pin_id, '00000000-0000-0000-0000-000000000000'), COALESCE(comment_id, '00000000-0000-0000-0000-000000000000'));
