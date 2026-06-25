-- 历史星图 PostgreSQL 数据库Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- 用于模糊搜索

-- 朝代
CREATE TABLE dynasties (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(32) NOT NULL,
  full_name VARCHAR(64),
  english_name VARCHAR(64),
  span VARCHAR(64),
  founded VARCHAR(128),
  capital VARCHAR(128),
  ended VARCHAR(128),
  summary TEXT,
  stats JSONB DEFAULT '[]',
  status VARCHAR(16) DEFAULT 'partial',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 地点
CREATE TABLE locations (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  description TEXT,
  latitude FLOAT,
  longitude FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 人物
CREATE TABLE persons (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  alias VARCHAR(128),
  born INT,
  died INT,
  dynasty VARCHAR(32) REFERENCES dynasties(id),
  roles TEXT[],
  short_intro TEXT,
  full_intro TEXT,
  achievements TEXT[],
  controversy TEXT,
  quote TEXT,
  quote_source VARCHAR(256),
  works TEXT[],
  life_events JSONB DEFAULT '[]',
  bio_sections JSONB DEFAULT '[]',
  classics JSONB DEFAULT '[]',
  appraisals JSONB DEFAULT '[]',
  works_detail JSONB DEFAULT '[]',
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 事件
CREATE TABLE events (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  dynasty VARCHAR(32) REFERENCES dynasties(id),
  start_year INT,
  end_year INT,
  place VARCHAR(128),
  place_id VARCHAR(32) REFERENCES locations(id),
  short_intro TEXT,
  background TEXT,
  process TEXT,
  result TEXT,
  controversy TEXT,
  chain JSONB DEFAULT '[]',
  related_event_ids TEXT[],
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 人物-事件关联
CREATE TABLE person_events (
  id SERIAL PRIMARY KEY,
  person_id VARCHAR(32) REFERENCES persons(id) ON DELETE CASCADE,
  event_id VARCHAR(32) REFERENCES events(id) ON DELETE CASCADE,
  role VARCHAR(64) DEFAULT '参与',
  UNIQUE(person_id, event_id)
);

-- 关系（人物-人物、人物-事件、事件-事件）
CREATE TABLE relations (
  id SERIAL PRIMARY KEY,
  source_id VARCHAR(32) NOT NULL,
  target_id VARCHAR(32) NOT NULL,
  relation_type VARCHAR(64) NOT NULL,
  label VARCHAR(64),
  description TEXT,
  source_ref VARCHAR(256),
  start_year INT,
  end_year INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_relations_source ON relations(source_id);
CREATE INDEX idx_relations_target ON relations(target_id);

-- 来源/史料
CREATE TABLE sources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  level VARCHAR(8) CHECK (level IN ('A','B','C','D')),
  entity_type VARCHAR(16),
  entity_id VARCHAR(32),
  volume VARCHAR(128),
  page VARCHAR(64),
  url VARCHAR(512),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sources_entity ON sources(entity_type, entity_id);

-- 用户
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(256) UNIQUE NOT NULL,
  password_hash VARCHAR(256) NOT NULL,
  name VARCHAR(64),
  plan VARCHAR(16) DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 收藏
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  entity_type VARCHAR(16) NOT NULL,
  entity_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entity_type, entity_id)
);

-- 浏览历史
CREATE TABLE history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  entity_type VARCHAR(16) NOT NULL,
  entity_id VARCHAR(32) NOT NULL,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_history_user ON history(user_id, visited_at DESC);

-- 导出记录
CREATE TABLE exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  entity_type VARCHAR(16) NOT NULL,
  entity_id VARCHAR(32) NOT NULL,
  name VARCHAR(256),
  format VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 全文搜索视图（Elasticsearch 同步用）
CREATE MATERIALIZED VIEW search_index AS
SELECT
  id AS entity_id,
  'person' AS entity_type,
  name AS title,
  alias AS aliases,
  short_intro AS summary,
  full_intro AS content,
  dynasty,
  roles AS tags,
  born AS start_year,
  died AS end_year,
  published
FROM persons
UNION ALL
SELECT
  id AS entity_id,
  'event' AS entity_type,
  name AS title,
  '' AS aliases,
  short_intro AS summary,
  background || ' ' || process || ' ' || result AS content,
  dynasty,
  ARRAY[]::TEXT[] AS tags,
  start_year,
  end_year,
  published
FROM events
UNION ALL
SELECT
  id AS entity_id,
  'dynasty' AS entity_type,
  full_name AS title,
  name AS aliases,
  summary,
  summary AS content,
  id AS dynasty,
  ARRAY[]::TEXT[] AS tags,
  NULL AS start_year,
  NULL AS end_year,
  TRUE AS published
FROM dynasties;

CREATE INDEX idx_search_title ON search_index USING gin(title gin_trgm_ops);
CREATE INDEX idx_search_content ON search_index USING gin(content gin_trgm_ops);
