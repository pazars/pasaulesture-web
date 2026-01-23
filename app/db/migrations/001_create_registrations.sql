CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,

  -- Stripe data
  stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  amount_paid INTEGER,
  currency VARCHAR(3) DEFAULT 'eur',

  -- Event data
  event_slug VARCHAR(100) NOT NULL,
  distance_index INTEGER NOT NULL,

  -- Participant data
  participant_name VARCHAR(255) NOT NULL,
  participant_email VARCHAR(255) NOT NULL,

  -- Metadata
  locale VARCHAR(5) DEFAULT 'lv',
  payment_status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add payment_status column if it doesn't exist (for existing tables)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE registrations ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending' NOT NULL;
  END IF;
END $$;

-- Make amount_paid nullable if it isn't already (for existing tables)
DO $$
BEGIN
  ALTER TABLE registrations ALTER COLUMN amount_paid DROP NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
  WHEN others THEN NULL;
END $$;

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;

CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_event_slug ON registrations(event_slug);
CREATE INDEX IF NOT EXISTS idx_participant_email ON registrations(participant_email);
CREATE INDEX IF NOT EXISTS idx_created_at ON registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_status ON registrations(payment_status);
