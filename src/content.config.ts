import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ── Properties Collection ──────────────────────────────────────
// Each suite is one Markdown file in src/content/properties/.
// The slug (filename without .md) maps to the URL: /properties/[slug]
const properties = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/properties' }),
  schema: z.object({
    // ── Identity ───────────────────────────────────────────────
    title:       z.string(),            // "Gulmohar — Suite 101"
    suiteNumber: z.string(),            // "101"
    tagline:     z.string(),            // "Panoramic forest & city view"
    location:    z.string(),            // "VJ IndiLife, Pashan, Pune"
    address:     z.string(),            // Full address for Google Maps embed

    // ── Pricing ────────────────────────────────────────────────
    pricePerNight: z.number(),          // 3699 (INR)

    // ── Capacity & Specs ───────────────────────────────────────
    maxGuests:  z.number().default(4),
    bedType:    z.string(),             // "1 Super King"
    sqft:       z.number().default(500),
    floor:      z.number().default(14),
    roomType:   z.enum(['Studio', '1BHK', '2BHK']).default('Studio'),

    // ── Social Proof ───────────────────────────────────────────
    rating:       z.number().min(0).max(5).default(5.0),
    reviewCount:  z.number().default(0),

    // ── Policies ───────────────────────────────────────────────
    checkIn:   z.string().default('01:00 PM'),
    checkOut:  z.string().default('11:00 AM'),
    minNights: z.number().default(1),

    // ── Media ──────────────────────────────────────────────────
    heroImage: z.string(),              // Primary listing photo URL
    gallery:   z.array(z.string()),     // Additional photo URLs

    // ── Amenities ──────────────────────────────────────────────
    amenities: z.array(z.string()),

    // ── Availability & Channel Integration ────────────────────
    // Key name of the env var holding this suite's Airbnb ICS URL.
    // e.g. "AIRBNB_URBO_GULMOHAR"
    airbnbIcsEnvVar:   z.string().optional(),
    // Future: Beds24 property ID for two-way channel sync
    beds24PropertyId:  z.string().optional(),

    // ── Display Controls ───────────────────────────────────────
    featured:  z.boolean().default(true),
    order:     z.number().default(99),
    isActive:  z.boolean().default(true),
  }),
});

// ── Blog Collection ────────────────────────────────────────────
// SEO articles live in src/content/blog/.
// URL pattern: /blog/[slug]
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title:         z.string(),
    excerpt:       z.string(),              // Meta description + card preview
    author:        z.string().default('UrboSuites Team'),
    publishedDate: z.coerce.date(),
    updatedDate:   z.coerce.date().optional(),
    coverImage:    z.string(),
    tags:          z.array(z.string()),
    readTime:      z.string().optional(),   // e.g. "5 min read"
    featured:      z.boolean().default(false),
    noindex:       z.boolean().default(false),
  }),
});

export const collections = { properties, blog };
