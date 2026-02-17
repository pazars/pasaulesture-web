-- Migration: Add discount code tracking fields
-- Date: 2026-01-28
-- Description: Adds coupon_id and original_price columns to track discount codes used during checkout

-- Add coupon_id column to track which Stripe coupon was used
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'coupon_id'
  ) THEN
    ALTER TABLE registrations ADD COLUMN coupon_id VARCHAR(255);
  END IF;
END $$;

-- Add original_price column to track price before discount
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'original_price'
  ) THEN
    ALTER TABLE registrations ADD COLUMN original_price INTEGER;
  END IF;
END $$;

-- Add index for coupon analytics queries
CREATE INDEX IF NOT EXISTS idx_coupon_id ON registrations(coupon_id);

-- Add comments for documentation
COMMENT ON COLUMN registrations.coupon_id IS 'Stripe coupon ID if discount was applied to this registration';
COMMENT ON COLUMN registrations.original_price IS 'Original price in cents before discount was applied';
