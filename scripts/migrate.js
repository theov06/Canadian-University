const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const schema = `
-- Locations
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  city_size VARCHAR(20) CHECK (city_size IN ('small','medium','large')),
  estimated_monthly_living_cost INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Universities
CREATE TABLE IF NOT EXISTS universities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  location_id INTEGER REFERENCES locations(id),
  website_url TEXT,
  logo_url TEXT,
  ranking_proxy INTEGER,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programs
CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  degree_type VARCHAR(50) DEFAULT 'BA',
  description TEXT,
  has_coop BOOLEAN DEFAULT FALSE,
  program_url TEXT,
  career_outcomes TEXT[],
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(university_id, slug)
);

-- Requirements
CREATE TABLE IF NOT EXISTS requirements (
  id SERIAL PRIMARY KEY,
  program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
  ielts_overall NUMERIC(2,1),
  ielts_min_band NUMERIC(2,1),
  toefl_ibt INTEGER,
  min_gpa NUMERIC(3,2),
  additional_requirements TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Costs
CREATE TABLE IF NOT EXISTS costs (
  id SERIAL PRIMARY KEY,
  program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
  tuition_yearly_international INTEGER NOT NULL,
  tuition_yearly_domestic INTEGER,
  additional_fees INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'CAD',
  academic_year VARCHAR(9),
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_programs_university ON programs(university_id);
CREATE INDEX IF NOT EXISTS idx_requirements_program ON requirements(program_id);
CREATE INDEX IF NOT EXISTS idx_costs_program ON costs(program_id);
CREATE INDEX IF NOT EXISTS idx_universities_location ON universities(location_id);
CREATE INDEX IF NOT EXISTS idx_universities_slug ON universities(slug);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(schema);
    console.log("✅ Database migration complete");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
