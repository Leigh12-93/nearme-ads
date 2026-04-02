-- CheapXNearMe Ad Network — Database Schema
-- Revenue model: Providers pay monthly budget or per-lead bid to appear in search results
-- across all CheapXNearMe vertical sites (skip bins, electricians, plumbers, etc.)

-- ============================================================
-- VERTICALS — the CheapXNearMe sites in the network
-- ============================================================
CREATE TABLE IF NOT EXISTS verticals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,          -- 'skip-bins', 'electricians', 'plumbers', etc.
  name VARCHAR(100) NOT NULL,                 -- 'Skip Bins', 'Electricians', etc.
  domain VARCHAR(200) NOT NULL,               -- 'cheapskipbinsnearme.com.au'
  service_type VARCHAR(100) NOT NULL,         -- 'Skip Bin Hire', 'Electrical Services'
  icon VARCHAR(50),                           -- lucide icon name
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO verticals (slug, name, domain, service_type) VALUES
  ('skip-bins', 'Skip Bins', 'cheapskipbinsnearme.com.au', 'Skip Bin Hire'),
  ('electricians', 'Electricians', 'cheapelectriciansnearme.com.au', 'Electrical Services'),
  ('plumbers', 'Plumbers', 'cheapplumbersnearme.com.au', 'Plumbing Services'),
  ('cleaners', 'Cleaners', 'cheapcleanersnearme.com.au', 'Cleaning Services'),
  ('locksmiths', 'Locksmiths', 'cheaplocksmithsnearme.com.au', 'Locksmith Services'),
  ('removalists', 'Removalists', 'cheapremovalistsnearme.com.au', 'Removalist Services')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PROVIDER ACCOUNTS — businesses that advertise on the network
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(200) NOT NULL,
  business_name VARCHAR(200) NOT NULL,
  contact_name VARCHAR(200),
  phone VARCHAR(50),
  website VARCHAR(500),
  abn VARCHAR(20),                            -- Australian Business Number
  state VARCHAR(10) NOT NULL DEFAULT 'SA',
  service_areas TEXT[],                        -- postcodes/suburbs they service
  logo_url VARCHAR(500),
  verified BOOLEAN DEFAULT false,             -- ABN verified
  active BOOLEAN DEFAULT true,
  stripe_customer_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ad_providers_email ON ad_providers(email);
CREATE INDEX idx_ad_providers_active ON ad_providers(active);

-- ============================================================
-- CAMPAIGNS — provider's ad spend per vertical
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES ad_providers(id) ON DELETE CASCADE,
  vertical_id UUID NOT NULL REFERENCES verticals(id),

  -- Budget
  budget_type VARCHAR(20) NOT NULL DEFAULT 'monthly',  -- 'monthly' | 'per_lead'
  monthly_budget DECIMAL(10,2),               -- max monthly spend (for monthly type)
  per_lead_bid DECIMAL(10,2),                 -- bid per lead (for per_lead type)
  daily_budget_cap DECIMAL(10,2),             -- optional daily cap

  -- Targeting
  target_areas TEXT[],                         -- specific postcodes/suburbs (null = all their service areas)
  target_services TEXT[],                      -- specific service types within vertical

  -- Status
  status VARCHAR(20) DEFAULT 'active',        -- 'active' | 'paused' | 'exhausted' | 'draft'
  month_spend DECIMAL(10,2) DEFAULT 0,        -- current month spend
  month_leads INTEGER DEFAULT 0,              -- current month leads
  month_impressions INTEGER DEFAULT 0,
  month_clicks INTEGER DEFAULT 0,

  -- Ranking boost
  boost_score DECIMAL(5,2) DEFAULT 1.0,       -- calculated from bid/budget, affects ranking

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(provider_id, vertical_id)
);

CREATE INDEX idx_ad_campaigns_provider ON ad_campaigns(provider_id);
CREATE INDEX idx_ad_campaigns_vertical ON ad_campaigns(vertical_id);
CREATE INDEX idx_ad_campaigns_status ON ad_campaigns(status);

-- ============================================================
-- IMPRESSIONS — when a provider listing is shown in search results
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES ad_providers(id),
  vertical_id UUID NOT NULL REFERENCES verticals(id),
  search_postcode VARCHAR(10),
  search_query TEXT,
  position INTEGER,                           -- rank position in results
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ad_impressions_campaign ON ad_impressions(campaign_id);
CREATE INDEX idx_ad_impressions_date ON ad_impressions(created_at);

-- ============================================================
-- CLICKS — when a user clicks on a provider listing
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  impression_id UUID REFERENCES ad_impressions(id),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES ad_providers(id),
  vertical_id UUID NOT NULL REFERENCES verticals(id),
  click_type VARCHAR(20) DEFAULT 'listing',   -- 'listing' | 'phone' | 'website' | 'quote'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ad_clicks_campaign ON ad_clicks(campaign_id);
CREATE INDEX idx_ad_clicks_date ON ad_clicks(created_at);

-- ============================================================
-- LEADS — when a user submits a quote request to a provider
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES ad_providers(id),
  vertical_id UUID NOT NULL REFERENCES verticals(id),

  -- Lead details
  customer_name VARCHAR(200),
  customer_phone VARCHAR(50),
  customer_email VARCHAR(200),
  customer_suburb VARCHAR(200),
  customer_postcode VARCHAR(10),
  service_details TEXT,

  -- Billing
  charge_amount DECIMAL(10,2) NOT NULL DEFAULT 0,  -- actual charge for this lead
  charged BOOLEAN DEFAULT false,

  -- Status
  status VARCHAR(20) DEFAULT 'new',           -- 'new' | 'contacted' | 'won' | 'lost'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ad_leads_campaign ON ad_leads(campaign_id);
CREATE INDEX idx_ad_leads_provider ON ad_leads(provider_id);
CREATE INDEX idx_ad_leads_date ON ad_leads(created_at);

-- ============================================================
-- BILLING — Stripe payment records
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_billing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES ad_providers(id) ON DELETE CASCADE,

  -- Stripe
  stripe_invoice_id VARCHAR(100),
  stripe_payment_intent VARCHAR(100),

  -- Amount
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'AUD',
  status VARCHAR(20) DEFAULT 'pending',       -- 'pending' | 'paid' | 'failed' | 'refunded'

  -- Period
  billing_period_start DATE,
  billing_period_end DATE,

  -- Breakdown
  total_impressions INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_leads INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ad_billing_provider ON ad_billing(provider_id);
CREATE INDEX idx_ad_billing_status ON ad_billing(status);

-- ============================================================
-- SESSIONS — provider login sessions (JWT)
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES ad_providers(id) ON DELETE CASCADE,
  token_hash VARCHAR(200) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ad_sessions_provider ON ad_sessions(provider_id);
CREATE INDEX idx_ad_sessions_expires ON ad_sessions(expires_at);

-- ============================================================
-- ANALYTICS VIEWS
-- ============================================================

-- Provider dashboard summary
CREATE OR REPLACE VIEW provider_dashboard AS
SELECT
  p.id AS provider_id,
  p.business_name,
  COUNT(DISTINCT c.id) AS active_campaigns,
  COALESCE(SUM(c.month_impressions), 0) AS total_impressions,
  COALESCE(SUM(c.month_clicks), 0) AS total_clicks,
  COALESCE(SUM(c.month_leads), 0) AS total_leads,
  COALESCE(SUM(c.month_spend), 0) AS total_spend,
  CASE WHEN SUM(c.month_impressions) > 0
    THEN ROUND(SUM(c.month_clicks)::DECIMAL / SUM(c.month_impressions) * 100, 2)
    ELSE 0 END AS ctr,
  CASE WHEN SUM(c.month_leads) > 0
    THEN ROUND(SUM(c.month_spend) / SUM(c.month_leads), 2)
    ELSE 0 END AS cost_per_lead
FROM ad_providers p
LEFT JOIN ad_campaigns c ON c.provider_id = p.id AND c.status = 'active'
GROUP BY p.id, p.business_name;

-- Network-wide analytics (for Pi-Chi admin)
CREATE OR REPLACE VIEW network_analytics AS
SELECT
  v.slug AS vertical,
  v.name AS vertical_name,
  COUNT(DISTINCT c.provider_id) AS active_providers,
  COALESCE(SUM(c.month_impressions), 0) AS impressions,
  COALESCE(SUM(c.month_clicks), 0) AS clicks,
  COALESCE(SUM(c.month_leads), 0) AS leads,
  COALESCE(SUM(c.month_spend), 0) AS revenue
FROM verticals v
LEFT JOIN ad_campaigns c ON c.vertical_id = v.id AND c.status = 'active'
GROUP BY v.slug, v.name
ORDER BY revenue DESC;
