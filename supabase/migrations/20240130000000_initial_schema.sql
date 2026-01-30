-- Swipe to Dine - Initial Database Schema
-- This migration creates the core tables for the application

-- Note: gen_random_uuid() is available natively in PostgreSQL 13+
-- No extension needed for UUID generation

-- Create custom types
CREATE TYPE attendance_mode AS ENUM ('remote', 'onDeck');
CREATE TYPE vote_status AS ENUM ('no', 'maybe');
CREATE TYPE avatar_type AS ENUM ('generated', 'uploaded');

-- ============================================================================
-- Profiles Table
-- Stores user profiles with cuisine preferences
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  avatar TEXT NOT NULL,
  avatar_type avatar_type NOT NULL DEFAULT 'generated',
  cuisine_preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for phone lookup
CREATE INDEX idx_profiles_phone ON profiles(phone);

-- ============================================================================
-- Parties Table
-- Stores dining party/session information
-- ============================================================================
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id TEXT NOT NULL UNIQUE,
  host_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  date_time TIMESTAMPTZ,
  filters JSONB NOT NULL DEFAULT '{}',
  matched_restaurant_id TEXT,
  matched_at TIMESTAMPTZ,
  current_restaurant_index INTEGER NOT NULL DEFAULT 0,
  current_ondeck_diner_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for invite lookups
CREATE INDEX idx_parties_invite_id ON parties(invite_id);

-- ============================================================================
-- Party Diners Table
-- Links profiles to parties with attendance mode
-- ============================================================================
CREATE TABLE party_diners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mode attendance_mode NOT NULL DEFAULT 'remote',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure a profile can only be in a party once
  UNIQUE(party_id, profile_id)
);

-- Indexes for efficient lookups
CREATE INDEX idx_party_diners_party_id ON party_diners(party_id);
CREATE INDEX idx_party_diners_profile_id ON party_diners(profile_id);

-- ============================================================================
-- Party Votes Table
-- Stores votes for each restaurant by each diner
-- ============================================================================
CREATE TABLE party_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id TEXT NOT NULL,
  vote vote_status NOT NULL,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One vote per diner per restaurant per party
  UNIQUE(party_id, profile_id, restaurant_id)
);

-- Indexes for efficient lookups
CREATE INDEX idx_party_votes_party_id ON party_votes(party_id);
CREATE INDEX idx_party_votes_restaurant_id ON party_votes(restaurant_id);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- For simplicity, we enable public access since we don't have user auth yet
-- In production, you'd implement proper auth with Supabase Auth
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_diners ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_votes ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for now (would be restricted with auth in production)
CREATE POLICY "Allow public access to profiles"
  ON profiles FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to parties"
  ON parties FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to party_diners"
  ON party_diners FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to party_votes"
  ON party_votes FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Triggers for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parties_updated_at
  BEFORE UPDATE ON parties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Real-time subscriptions
-- Enable realtime for vote and party updates
-- ============================================================================

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE party_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE parties;
ALTER PUBLICATION supabase_realtime ADD TABLE party_diners;
