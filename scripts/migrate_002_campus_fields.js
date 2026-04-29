/**
 * Migration 002: Add campus-related fields for multi-campus universities.
 * Non-destructive — only adds columns and tables if they don't exist.
 */
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const migration = `
-- Add campus_name to universities (nullable, backward compatible)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'universities' AND column_name = 'campus_name'
  ) THEN
    ALTER TABLE universities ADD COLUMN campus_name VARCHAR(255);
  END IF;
END $$;

-- Add country to universities
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'universities' AND column_name = 'country'
  ) THEN
    ALTER TABLE universities ADD COLUMN country VARCHAR(100) DEFAULT 'Canada';
  END IF;
END $$;

-- Add duration_years and total_credits to programs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programs' AND column_name = 'duration_years'
  ) THEN
    ALTER TABLE programs ADD COLUMN duration_years INTEGER DEFAULT 4;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programs' AND column_name = 'total_credits'
  ) THEN
    ALTER TABLE programs ADD COLUMN total_credits INTEGER;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programs' AND column_name = 'arts_credits'
  ) THEN
    ALTER TABLE programs ADD COLUMN arts_credits INTEGER;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programs' AND column_name = 'faculty'
  ) THEN
    ALTER TABLE programs ADD COLUMN faculty VARCHAR(255);
  END IF;
END $$;

-- Add per_credit_amount to costs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'costs' AND column_name = 'per_credit_amount'
  ) THEN
    ALTER TABLE costs ADD COLUMN per_credit_amount NUMERIC(10,2);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'costs' AND column_name = 'total_program_estimate'
  ) THEN
    ALTER TABLE costs ADD COLUMN total_program_estimate INTEGER;
  END IF;
END $$;

-- Create fees table for student fees, insurance, etc.
CREATE TABLE IF NOT EXISTS fees (
  id SERIAL PRIMARY KEY,
  university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
  fee_name VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'CAD',
  period VARCHAR(20) DEFAULT 'yearly',
  notes TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sources tracking table
CREATE TABLE IF NOT EXISTS sources (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  source_url TEXT NOT NULL,
  description TEXT,
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fees_university ON fees(university_id);
CREATE INDEX IF NOT EXISTS idx_sources_entity ON sources(entity_type, entity_id);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(migration);
    console.log("✅ Migration 002 complete — campus fields added");
  } catch (err) {
    console.error("❌ Migration 002 failed:", err.message);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
