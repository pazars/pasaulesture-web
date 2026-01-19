CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,

  -- Stripe data
  stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  amount_paid INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'eur',

  -- Event data
  event_slug VARCHAR(100) NOT NULL,
  distance_index INTEGER NOT NULL,

  -- Participant data
  participant_name VARCHAR(255) NOT NULL,
  participant_email VARCHAR(255) NOT NULL,

  -- Metadata
  locale VARCHAR(5) DEFAULT 'lv',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_event_slug ON registrations(event_slug);
CREATE INDEX idx_participant_email ON registrations(participant_email);
CREATE INDEX idx_created_at ON registrations(created_at);
