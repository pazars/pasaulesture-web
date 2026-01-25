-- Migration: Add preferred communication channel for preparation tips
-- Date: 2026-01-25

ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS preparation_tips_channel VARCHAR(100);
