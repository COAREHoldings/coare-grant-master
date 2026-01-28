-- Publications Module Database Schema
-- Run this migration in your Neon PostgreSQL database

-- Publications table: stores user publications
CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pmid VARCHAR(20),
  pmcid VARCHAR(20),
  doi VARCHAR(100),
  title TEXT NOT NULL,
  authors JSONB DEFAULT '[]',
  journal VARCHAR(255),
  year INTEGER,
  volume VARCHAR(50),
  issue VARCHAR(50),
  pages VARCHAR(50),
  citation_count INTEGER DEFAULT 0,
  abstract TEXT,
  keywords JSONB DEFAULT '[]',
  grant_acknowledgments JSONB DEFAULT '[]',
  research_themes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Manuscripts table: stores user manuscripts
CREATE TABLE IF NOT EXISTS manuscripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  grant_id UUID,
  title TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  target_journal VARCHAR(255),
  co_authors JSONB DEFAULT '[]',
  content JSONB DEFAULT '{}',
  submission_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Manuscript revisions table: stores manuscript revision history
CREATE TABLE IF NOT EXISTS manuscript_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id UUID NOT NULL,
  revision_number INTEGER DEFAULT 1,
  reviewer_comments JSONB DEFAULT '[]',
  response_letter TEXT,
  changes_made JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research profiles table: stores computed research profile data
CREATE TABLE IF NOT EXISTS research_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_publications INTEGER DEFAULT 0,
  h_index INTEGER DEFAULT 0,
  total_citations INTEGER DEFAULT 0,
  top_cited_works JSONB DEFAULT '[]',
  research_themes JSONB DEFAULT '[]',
  collaborators JSONB DEFAULT '[]',
  yearly_output JSONB DEFAULT '[]',
  biosketch_section_c TEXT,
  biosketch_section_d TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant-Publications link table: connects grants to publications
CREATE TABLE IF NOT EXISTS grant_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID NOT NULL,
  publication_id UUID NOT NULL,
  relationship VARCHAR(50) NOT NULL, -- 'preliminary_data', 'outcome', 'cited'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_publications_user_id ON publications(user_id);
CREATE INDEX IF NOT EXISTS idx_publications_doi ON publications(doi);
CREATE INDEX IF NOT EXISTS idx_publications_pmid ON publications(pmid);
CREATE INDEX IF NOT EXISTS idx_manuscripts_user_id ON manuscripts(user_id);
CREATE INDEX IF NOT EXISTS idx_manuscripts_grant_id ON manuscripts(grant_id);
CREATE INDEX IF NOT EXISTS idx_manuscript_revisions_manuscript_id ON manuscript_revisions(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_research_profiles_user_id ON research_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_grant_publications_grant_id ON grant_publications(grant_id);
CREATE INDEX IF NOT EXISTS idx_grant_publications_publication_id ON grant_publications(publication_id);
