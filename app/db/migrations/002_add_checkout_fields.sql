-- Migration: Add checkout fields for phone, emergency contact, accommodation, and tips
-- Date: 2026-01-25

-- Add new columns to registrations table
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS participant_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS needs_accommodation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS accommodation_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS accommodation_waitlist BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS wants_preparation_tips BOOLEAN DEFAULT FALSE;

-- Add index for accommodation queries (finding dorm spots)
CREATE INDEX IF NOT EXISTS idx_accommodation_type ON registrations(accommodation_type);
CREATE INDEX IF NOT EXISTS idx_accommodation_waitlist ON registrations(accommodation_waitlist);
