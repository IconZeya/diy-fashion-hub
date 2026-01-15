-- Migration 05: DIY Requests System
-- Creates tables for DIY requests feed where users can ask for help and others can reply with photos

-- Main requests table
CREATE TABLE diy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Request replies table (with optional images)
CREATE TABLE request_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES diy_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES request_replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_diy_requests_user ON diy_requests(user_id);
CREATE INDEX idx_diy_requests_created ON diy_requests(created_at DESC);
CREATE INDEX idx_diy_requests_tags ON diy_requests USING GIN(tags);

CREATE INDEX idx_request_replies_request ON request_replies(request_id);
CREATE INDEX idx_request_replies_user ON request_replies(user_id);
CREATE INDEX idx_request_replies_parent ON request_replies(parent_reply_id);

-- Full text search index for searching requests
CREATE INDEX idx_diy_requests_search ON diy_requests USING GIN(to_tsvector('english', title || ' ' || content));

-- Function to update reply count
CREATE OR REPLACE FUNCTION update_request_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE diy_requests SET reply_count = reply_count + 1 WHERE id = NEW.request_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE diy_requests SET reply_count = reply_count - 1 WHERE id = OLD.request_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reply count
CREATE TRIGGER trigger_update_reply_count
AFTER INSERT OR DELETE ON request_replies
FOR EACH ROW EXECUTE FUNCTION update_request_reply_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_diy_requests_updated
BEFORE UPDATE ON diy_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_request_replies_updated
BEFORE UPDATE ON request_replies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
