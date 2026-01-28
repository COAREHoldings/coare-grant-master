-- CRE Phase 1 Tables

-- Interrogation responses (Idea Lab)
CREATE TABLE IF NOT EXISTS interrogation_responses (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  unmet_need TEXT,
  knowledge_gap TEXT,
  prior_attempts TEXT,
  why_now TEXT,
  hypothesis TEXT,
  hypothesis_score INTEGER DEFAULT 0,
  funding_alignment_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Statistical flags per aim
CREATE TABLE IF NOT EXISTS statistical_flags (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  aim_number INTEGER NOT NULL,
  has_sample_size BOOLEAN DEFAULT FALSE,
  has_control_groups BOOLEAN DEFAULT FALSE,
  has_randomization BOOLEAN DEFAULT FALSE,
  has_primary_endpoints BOOLEAN DEFAULT FALSE,
  has_statistical_tests BOOLEAN DEFAULT FALSE,
  adequacy_score INTEGER DEFAULT 0,
  suggestions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CRE scores
CREATE TABLE IF NOT EXISTS cre_scores (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  hypothesis_clarity INTEGER DEFAULT 0,
  novelty INTEGER DEFAULT 0,
  mechanistic_depth INTEGER DEFAULT 0,
  statistical_rigor INTEGER DEFAULT 0,
  feasibility INTEGER DEFAULT 0,
  funding_alignment INTEGER DEFAULT 0,
  overall_score INTEGER DEFAULT 0,
  readiness_status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interrogation_app ON interrogation_responses(application_id);
CREATE INDEX IF NOT EXISTS idx_statistical_app ON statistical_flags(application_id);
CREATE INDEX IF NOT EXISTS idx_cre_app ON cre_scores(application_id);
