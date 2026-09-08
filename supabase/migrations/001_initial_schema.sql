-- ================================================================
-- UrboSuites — Supabase PostgreSQL Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- Project: pvbtafewlqyustjirbci (Urbosuites)
-- ================================================================

-- Prerequisites
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;   -- needed for EXCLUDE constraint

-- ================================================================
-- 1. SUITES — Master inventory for each studio unit
-- ================================================================
CREATE TABLE IF NOT EXISTS suites (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT UNIQUE NOT NULL,
  title               TEXT NOT NULL,
  suite_number        TEXT NOT NULL,
  room_type           TEXT NOT NULL DEFAULT 'Studio',
  price_per_night     INTEGER NOT NULL,         -- INR, no decimals
  max_guests          INTEGER NOT NULL DEFAULT 4,
  bed_type            TEXT NOT NULL DEFAULT '1 Super King',
  sqft                INTEGER NOT NULL DEFAULT 500,
  floor               INTEGER NOT NULL DEFAULT 14,
  amenities           JSONB NOT NULL DEFAULT '[]',
  hero_image          TEXT,
  gallery             JSONB DEFAULT '[]',
  check_in_time       TEXT DEFAULT '01:00 PM',
  check_out_time      TEXT DEFAULT '11:00 AM',
  min_nights          INTEGER DEFAULT 1,
  airbnb_ics_url      TEXT,                     -- Full Airbnb .ics URL (from env at sync time)
  beds24_property_id  TEXT,                     -- Future: Beds24 channel manager ID
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- 2. BOOKING STATUS + BOOKINGS — Full reservation ledger
-- ================================================================
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'inquiry_pending',  -- Webhook fired, awaiting host action
    'qr_sent',          -- UPI QR sent to guest via WhatsApp
    'confirmed',        -- Payment verified, dates permanently locked
    'cancelled',        -- Declined/cancelled by host or guest
    'expired'           -- 15-min soft block timed out
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS bookings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id              UUID NOT NULL REFERENCES suites(id) ON DELETE CASCADE,
  guest_name            TEXT NOT NULL,
  guest_phone           TEXT NOT NULL,          -- E.164 format e.g. +918530585574
  guest_email           TEXT NOT NULL,
  check_in              DATE NOT NULL,
  check_out             DATE NOT NULL,
  num_guests            INTEGER NOT NULL DEFAULT 2 CHECK (num_guests >= 1),
  price_per_night       INTEGER NOT NULL,       -- Snapshot at booking time (INR)
  total_payable         INTEGER NOT NULL,       -- price_per_night * nights
  status                booking_status NOT NULL DEFAULT 'inquiry_pending',
  special_requests      TEXT,
  soft_block_expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '15 minutes'),
  payment_verified_at   TIMESTAMPTZ,
  beds24_booking_id     TEXT,                   -- Future: synced Beds24 reference
  source                TEXT DEFAULT 'direct',  -- 'direct' | 'airbnb' | 'beds24'
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_dates CHECK (check_out > check_in)
);

-- Fast lookup for availability checks
CREATE INDEX IF NOT EXISTS idx_bookings_suite_dates
  ON bookings (suite_id, check_in, check_out)
  WHERE status IN ('inquiry_pending', 'qr_sent', 'confirmed');

-- ================================================================
-- 3. BLOCKED_DATES — Calendar availability matrix
-- Source of truth for the front-end date picker
-- ================================================================
CREATE TABLE IF NOT EXISTS blocked_dates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id    UUID NOT NULL REFERENCES suites(id) ON DELETE CASCADE,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,                    -- Exclusive (check-out date)
  source      TEXT NOT NULL DEFAULT 'manual',   -- 'airbnb_ics' | 'manual' | 'booking' | 'beds24'
  booking_id  UUID REFERENCES bookings(id) ON DELETE SET NULL,
  is_soft     BOOLEAN DEFAULT FALSE,            -- TRUE = 15-min temp hold only
  created_at  TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_block_range CHECK (end_date > start_date),
  -- Prevent overlapping hard blocks for the same suite
  CONSTRAINT no_overlapping_hard_blocks
    EXCLUDE USING gist (
      suite_id WITH =,
      daterange(start_date, end_date, '[)') WITH &&
    ) WHERE (is_soft = FALSE)
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_suite
  ON blocked_dates (suite_id, start_date, end_date);

-- ================================================================
-- 4. REVIEWS — Guest review storage
-- ================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id    UUID REFERENCES suites(id) ON DELETE SET NULL,
  guest_name  TEXT NOT NULL,
  guest_city  TEXT NOT NULL DEFAULT 'India',
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  stay_date   TEXT NOT NULL,                    -- Display string e.g. "Aug 2026"
  is_verified BOOLEAN DEFAULT TRUE,
  is_visible  BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_suite
  ON reviews (suite_id, is_visible);

-- ================================================================
-- 5. BLOGS — SEO article content store
-- ================================================================
CREATE TABLE IF NOT EXISTS blogs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  excerpt       TEXT,
  content       TEXT NOT NULL,                  -- Markdown body
  author        TEXT DEFAULT 'UrboSuites',
  cover_image   TEXT,
  tags          TEXT[] DEFAULT '{}',
  is_published  BOOLEAN DEFAULT TRUE,
  published_at  TIMESTAMPTZ DEFAULT now(),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- 6. ROW-LEVEL SECURITY (RLS)
-- ================================================================
ALTER TABLE suites        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs         ENABLE ROW LEVEL SECURITY;

-- Public (anon) read policies
CREATE POLICY "anon_read_suites"
  ON suites FOR SELECT USING (is_active = TRUE);

CREATE POLICY "anon_read_blocked_dates"
  ON blocked_dates FOR SELECT USING (TRUE);

CREATE POLICY "anon_read_reviews"
  ON reviews FOR SELECT USING (is_visible = TRUE);

CREATE POLICY "anon_read_blogs"
  ON blogs FOR SELECT USING (is_published = TRUE);

-- Service role full-access policies (used by Astro API routes + n8n)
CREATE POLICY "service_all_suites"
  ON suites FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "service_all_bookings"
  ON bookings FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "service_all_blocked_dates"
  ON blocked_dates FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "service_all_reviews"
  ON reviews FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "service_all_blogs"
  ON blogs FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ================================================================
-- 7. SOFT-BLOCK EXPIRY FUNCTION
-- Called by: Vercel Cron → /api/expire-soft-blocks every 5 min
-- ================================================================
CREATE OR REPLACE FUNCTION expire_stale_soft_blocks()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Remove expired temporary calendar holds
  DELETE FROM blocked_dates
  WHERE is_soft = TRUE
    AND created_at < (now() - INTERVAL '15 minutes');

  -- Mark associated pending bookings as expired
  UPDATE bookings
  SET status = 'expired', updated_at = now()
  WHERE status = 'inquiry_pending'
    AND soft_block_expires_at < now();
END;
$$;

-- ================================================================
-- 8. UPDATED_AT TRIGGER
-- Automatically refreshes updated_at on every row change
-- ================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER suites_updated_at
  BEFORE UPDATE ON suites
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ================================================================
-- 9. SEED DATA — UrboSuites initial suite records
-- ================================================================
INSERT INTO suites (slug, title, suite_number, price_per_night, max_guests, bed_type, sqft, floor, amenities, hero_image, gallery, airbnb_ics_url, is_active)
VALUES
  (
    'gulmohar',
    'Gulmohar — Suite 101',
    '101',
    3699,
    4,
    '1 Super King',
    500,
    14,
    '["High-speed Wi-Fi","55\" Smart TV","Inverter AC","Tea & Coffee","Full Kitchen","Covered Parking","Forest View","Rain Shower","Gym Access","Cafeteria","Curated Books","24/7 Security"]',
    '/images/suites/gulmohar/main.jpg',
    '["/images/suites/gulmohar/balcony.jpg","/images/suites/gulmohar/living.jpg","/images/suites/gulmohar/kitchen.jpg","/images/suites/gulmohar/bathroom.jpg"]',
    'https://www.airbnb.co.in/calendar/ical/1758545043929420373.ics?t=db1233bdb69f444e993ce09ab87cd165',
    TRUE
  ),
  (
    'hillcrest',
    'Hillcrest — Suite 201',
    '201',
    3499,
    4,
    '1 Super King',
    500,
    14,
    '["High-speed Wi-Fi","55\" Smart TV","Inverter AC","Tea & Coffee","Full Kitchen","Covered Parking","Forest View","Rain Shower","Gym Access","Cafeteria","Curated Books","24/7 Security"]',
    '/images/suites/hillcrest/main.jpg',
    '["/images/suites/hillcrest/living.jpg","/images/suites/hillcrest/balcony.jpg","/images/suites/hillcrest/kitchen.jpg","/images/suites/hillcrest/bathroom.jpg"]',
    'https://www.airbnb.co.in/calendar/ical/1733929974513817837.ics?t=453ee16c7c2f4f05a0388fec3b118c88',
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;

-- Seed initial reviews (matching UrboSuites brand copy)
INSERT INTO reviews (suite_id, guest_name, guest_city, rating, review_text, stay_date)
SELECT
  s.id,
  r.guest_name,
  r.guest_city,
  r.rating,
  r.review_text,
  r.stay_date
FROM suites s
CROSS JOIN (
  VALUES
    ('Sneha Rao',       'Hyderabad', 5,
     'Woke up to steaming chai and an unbelievable green view. The space is SO thoughtfully done — feels like a five-star without the five-star stiffness. Will definitely return.',
     'Aug 2026'),
    ('Arjun Mathews',   'Bangalore', 5,
     'Stayed for a work trip and ended up extending by two days. The Murphy bed mechanism is smooth, the kitchen has everything, and the AC is gloriously cold.',
     'July 2026'),
    ('Divya & Kiran',   'Pune',      5,
     'Perfect anniversary getaway. The balcony view in the morning mist was genuinely magical. Hosts were responsive and the apartment was exactly as photographed.',
     'Aug 2026')
) AS r(guest_name, guest_city, rating, review_text, stay_date)
WHERE s.slug = 'gulmohar'
ON CONFLICT DO NOTHING;
