/**
 * scripts/run-migration.mjs
 * Execute the Supabase SQL migration via the management API.
 * Run: node scripts/run-migration.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, '../supabase/migrations/001_initial_schema.sql'), 'utf8');

const PROJECT_ID = process.env.SUPABASE_PROJECT_ID || '';
const TOKEN      = process.env.SUPABASE_ACCESS_TOKEN || '';

async function runSQL(query) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ query }),
    }
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return JSON.parse(text);
}

// Split on double newlines between statement blocks so we avoid
// sending the entire 300-line file as one payload.
// Each chunk is executed sequentially.
const STATEMENTS = [
  // Extensions
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; CREATE EXTENSION IF NOT EXISTS btree_gist;`,

  // Suites table
  `CREATE TABLE IF NOT EXISTS suites (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                TEXT UNIQUE NOT NULL,
    title               TEXT NOT NULL,
    suite_number        TEXT NOT NULL,
    room_type           TEXT NOT NULL DEFAULT 'Studio',
    price_per_night     INTEGER NOT NULL,
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
    airbnb_ics_url      TEXT,
    beds24_property_id  TEXT,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
  )`,

  // Booking status enum + bookings table
  `DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
      'inquiry_pending','qr_sent','confirmed','cancelled','expired'
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `CREATE TABLE IF NOT EXISTS bookings (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suite_id              UUID NOT NULL REFERENCES suites(id) ON DELETE CASCADE,
    guest_name            TEXT NOT NULL,
    guest_phone           TEXT NOT NULL,
    guest_email           TEXT NOT NULL,
    check_in              DATE NOT NULL,
    check_out             DATE NOT NULL,
    num_guests            INTEGER NOT NULL DEFAULT 2 CHECK (num_guests >= 1),
    price_per_night       INTEGER NOT NULL,
    total_payable         INTEGER NOT NULL,
    status                booking_status NOT NULL DEFAULT 'inquiry_pending',
    special_requests      TEXT,
    soft_block_expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '15 minutes'),
    payment_verified_at   TIMESTAMPTZ,
    beds24_booking_id     TEXT,
    source                TEXT DEFAULT 'direct',
    created_at            TIMESTAMPTZ DEFAULT now(),
    updated_at            TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT valid_dates CHECK (check_out > check_in)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_bookings_suite_dates ON bookings (suite_id, check_in, check_out) WHERE status IN ('inquiry_pending', 'qr_sent', 'confirmed')`,

  // Blocked dates table
  `CREATE TABLE IF NOT EXISTS blocked_dates (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suite_id   UUID NOT NULL REFERENCES suites(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date   DATE NOT NULL,
    source     TEXT NOT NULL DEFAULT 'manual',
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    is_soft    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT valid_block_range CHECK (end_date > start_date)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_blocked_dates_suite ON blocked_dates (suite_id, start_date, end_date)`,

  // Reviews table
  `CREATE TABLE IF NOT EXISTS reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suite_id    UUID REFERENCES suites(id) ON DELETE SET NULL,
    guest_name  TEXT NOT NULL,
    guest_city  TEXT NOT NULL DEFAULT 'India',
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    stay_date   TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    is_visible  BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT now()
  )`,

  // Blogs table
  `CREATE TABLE IF NOT EXISTS blogs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         TEXT UNIQUE NOT NULL,
    title        TEXT NOT NULL,
    excerpt      TEXT,
    content      TEXT NOT NULL,
    author       TEXT DEFAULT 'UrboSuites',
    cover_image  TEXT,
    tags         TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
  )`,

  // Enable RLS
  `ALTER TABLE suites ENABLE ROW LEVEL SECURITY;
   ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
   ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
   ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
   ALTER TABLE blogs ENABLE ROW LEVEL SECURITY`,

  // RLS Policies
  `DO $$ BEGIN
    BEGIN CREATE POLICY "anon_read_suites" ON suites FOR SELECT USING (is_active = TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "anon_read_blocked_dates" ON blocked_dates FOR SELECT USING (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "anon_read_reviews" ON reviews FOR SELECT USING (is_visible = TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "anon_read_blogs" ON blogs FOR SELECT USING (is_published = TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "service_all_suites" ON suites FOR ALL USING (TRUE) WITH CHECK (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "service_all_bookings" ON bookings FOR ALL USING (TRUE) WITH CHECK (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "service_all_blocked_dates" ON blocked_dates FOR ALL USING (TRUE) WITH CHECK (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "service_all_reviews" ON reviews FOR ALL USING (TRUE) WITH CHECK (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "service_all_blogs" ON blogs FOR ALL USING (TRUE) WITH CHECK (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END $$`,

  // Soft-block expiry function
  `CREATE OR REPLACE FUNCTION expire_stale_soft_blocks() RETURNS void LANGUAGE plpgsql AS $$
  BEGIN
    DELETE FROM blocked_dates WHERE is_soft = TRUE AND created_at < (now() - INTERVAL '15 minutes');
    UPDATE bookings SET status = 'expired', updated_at = now() WHERE status = 'inquiry_pending' AND soft_block_expires_at < now();
  END;$$`,

  // updated_at trigger
  `CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
  BEGIN NEW.updated_at = now(); RETURN NEW; END;$$`,

  `DO $$ BEGIN
    CREATE TRIGGER suites_updated_at BEFORE UPDATE ON suites FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // Seed: Suites
  `INSERT INTO suites (slug, title, suite_number, price_per_night, max_guests, bed_type, sqft, floor, amenities, hero_image, gallery, airbnb_ics_url, is_active)
   VALUES (
     'gulmohar', 'Gulmohar — Suite 101', '101', 3699, 4, '1 Super King', 500, 14,
     '["High-speed Wi-Fi","55\\\" Smart TV","Inverter AC","Tea & Coffee","Full Kitchen","Covered Parking","Forest View","Rain Shower","Gym Access","Cafeteria","Curated Books","24/7 Security"]',
     '/images/suites/gulmohar/main.jpg', '["/images/suites/gulmohar/balcony.jpg"]',
     'https://www.airbnb.co.in/calendar/ical/1758545043929420373.ics?t=db1233bdb69f444e993ce09ab87cd165', TRUE
   ), (
     'hillcrest', 'Hillcrest — Suite 201', '201', 3499, 4, '1 Super King', 500, 14,
     '["High-speed Wi-Fi","55\\\" Smart TV","Inverter AC","Tea & Coffee","Full Kitchen","Covered Parking","Forest View","Rain Shower","Gym Access","Cafeteria","Curated Books","24/7 Security"]',
     '/images/suites/hillcrest/main.jpg', '["/images/suites/hillcrest/living.jpg"]',
     'https://www.airbnb.co.in/calendar/ical/1733929974513817837.ics?t=453ee16c7c2f4f05a0388fec3b118c88', TRUE
   ) ON CONFLICT (slug) DO NOTHING`,

  // Seed: Reviews
  `INSERT INTO reviews (suite_id, guest_name, guest_city, rating, review_text, stay_date)
   SELECT s.id, r.n, r.c, r.rt, r.rv, r.sd
   FROM suites s
   CROSS JOIN (VALUES
     ('Sneha Rao',     'Hyderabad', 5, 'Woke up to steaming chai and an unbelievable green view. The space is SO thoughtfully done — feels like a five-star without the five-star stiffness. Will definitely return.', 'Aug 2026'),
     ('Arjun Mathews', 'Bangalore', 5, 'Stayed for a work trip and ended up extending by two days. The Murphy bed mechanism is smooth, the kitchen has everything, and the AC is gloriously cold.', 'July 2026'),
     ('Divya & Kiran', 'Pune',      5, 'Perfect anniversary getaway. The balcony view in the morning mist was genuinely magical. Hosts were responsive and the apartment was exactly as photographed.', 'Aug 2026')
   ) AS r(n, c, rt, rv, sd)
   WHERE s.slug = 'gulmohar'
   ON CONFLICT DO NOTHING`,
];

let passed = 0;
let failed = 0;

for (const [i, stmt] of STATEMENTS.entries()) {
  const label = stmt.trim().split('\n')[0].substring(0, 60);
  try {
    await runSQL(stmt);
    console.log(`✓ [${i + 1}/${STATEMENTS.length}] ${label}`);
    passed++;
  } catch (err) {
    console.error(`✗ [${i + 1}/${STATEMENTS.length}] ${label}`);
    console.error(`  ${err.message}`);
    failed++;
  }
}

console.log(`\nMigration complete: ${passed} passed, ${failed} failed`);
