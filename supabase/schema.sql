-- ============================================================
-- MagnetVault Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CREATORS (Multi-tenant root)
-- ============================================================
CREATE TABLE creators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    channel_name TEXT NOT NULL,
    display_name TEXT,
    reply_to_email TEXT NOT NULL,
    website_url TEXT,
    logo_url TEXT,

    accent_color TEXT DEFAULT '#4F46E5',

    newsletter_webhook_url TEXT,

    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'free',

    monthly_subscriber_count INT DEFAULT 0,
    monthly_subscriber_reset_at TIMESTAMPTZ DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month'),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY creators_owner ON creators
    FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- 2. LEAD MAGNETS
-- ============================================================
CREATE TABLE lead_magnets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    hook_description TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    raw_markdown_content TEXT NOT NULL,

    button_cta TEXT DEFAULT 'Get Your Free Guide',
    accent_color TEXT,
    hero_image_url TEXT,
    social_proof_text TEXT,

    pdf_footer_text TEXT,
    include_cta_page BOOLEAN DEFAULT TRUE,
    cta_page_heading TEXT DEFAULT 'Want More?',
    cta_page_body TEXT,
    cta_page_url TEXT,

    is_published BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,

    total_subscribers INT DEFAULT 0,
    total_delivered INT DEFAULT 0,

    meta_title TEXT,
    meta_description TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lead_magnets ENABLE ROW LEVEL SECURITY;
CREATE POLICY magnets_owner ON lead_magnets
    FOR ALL USING (
        creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
    );
-- Public read for published magnets (landing pages)
CREATE POLICY magnets_public_read ON lead_magnets
    FOR SELECT USING (is_published = TRUE);

CREATE INDEX idx_magnets_slug ON lead_magnets(slug) WHERE is_published = TRUE;
CREATE INDEX idx_magnets_creator ON lead_magnets(creator_id);

-- ============================================================
-- 3. SUBSCRIBERS
-- ============================================================
CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    magnet_id UUID NOT NULL REFERENCES lead_magnets(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,

    subscriber_email TEXT NOT NULL,
    subscriber_name TEXT,

    status TEXT DEFAULT 'pending',

    delivered_at TIMESTAMPTZ,
    opened_email BOOLEAN DEFAULT FALSE,
    opened_at TIMESTAMPTZ,

    synced_to_newsletter BOOLEAN DEFAULT FALSE,
    synced_at TIMESTAMPTZ,

    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    referrer_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(magnet_id, subscriber_email)
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscribers_owner ON subscribers
    FOR ALL USING (
        creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
    );

CREATE INDEX idx_subscribers_magnet ON subscribers(magnet_id, created_at DESC);
CREATE INDEX idx_subscribers_creator ON subscribers(creator_id, created_at DESC);

-- ============================================================
-- 4. DELIVERY LOG
-- ============================================================
CREATE TABLE delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,

    step TEXT NOT NULL,
    status TEXT NOT NULL,
    duration_ms INT,
    error_message TEXT,
    metadata JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. RPC FUNCTIONS (denormalized counters)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_magnet_subscribers(target_magnet_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE lead_magnets
    SET total_subscribers = total_subscribers + 1,
        total_delivered = total_delivered + 1
    WHERE id = target_magnet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_creator_monthly_subs(target_creator_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE creators
    SET monthly_subscriber_count = monthly_subscriber_count + 1
    WHERE id = target_creator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
