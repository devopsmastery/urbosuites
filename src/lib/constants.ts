/**
 * src/lib/constants.ts
 * ─────────────────────────────────────────────────────────────
 * Brand copy, contact details, property metadata, and static
 * configuration. Single source of truth — import from here,
 * never hardcode in components.
 * ─────────────────────────────────────────────────────────────
 */

// ── Brand Identity ─────────────────────────────────────────────
export const BRAND = {
  name:       'UrboSuites',
  tagline:    'Urban Living. Forest Views.',
  subLabel:   'Premium Studio · VJ IndiLife',
  domain:     'urbosuites.in',
  year:       2024,
} as const;

// ── Contact Information ────────────────────────────────────────
export const CONTACT = {
  phone:       '+91 8530 58 55 74',
  phoneTel:    'tel:+918530585574',        // href for <a> tags
  whatsapp:    'https://wa.me/918530585574',
  email:       'stay@urbosuites.in',
  emailHref:   'mailto:stay@urbosuites.in',
  instagram:   '@urbosuites',
  instagramUrl: 'https://instagram.com/urbosuites',
} as const;

// ── Property Address ───────────────────────────────────────────
export const ADDRESS = {
  building:   'VJ IndiLife Building C',
  road:       'Pashan Sus Road',
  locality:   'Pashan',
  city:       'Pune',
  state:      'Maharashtra',
  pin:        '411021',
  country:    'India',
  countryCode: 'IN',
  full:       'VJ IndiLife Building C, Pashan Sus Road, Pashan, Pune, Maharashtra 411021',
  mapsUrl:    'https://maps.app.goo.gl/hV5NMQVojf9UpE5V9',
  mapsEmbed:  'https://maps.google.com/maps?q=VJ+Indilife+Building+C,+Pashan+Sus+Road,+Pune&output=embed&z=15',
  geo: {
    lat: 18.5483,
    lng: 73.7744,
  },
} as const;

// ── House Policies ─────────────────────────────────────────────
export const POLICIES = {
  checkIn:     '01:00 PM',
  checkOut:    '11:00 AM',
  minNights:   1,
  maxGuests:   4,
  cancellation: 'Free cancellation up to 72 hours before check-in.',
  payment:      'No payment required until booking is confirmed by host.',
} as const;

// ── Suite ICS Calendar Env Variable Keys ───────────────────────
// These map to the AIRBNB_URBO_* env vars in .env
// The ICS parser uses these to fetch availability feeds.
export const ICS_ENV_KEYS: Record<string, string> = {
  gulmohar:  'AIRBNB_URBO_GULMOHAR',
  hillcrest: 'AIRBNB_URBO_HILLCREST',
} as const;

// ── Amenity List (matches Full-Website-Template.jpg) ──────────
export const AMENITIES = [
  { name: 'High-speed Wi-Fi',  icon: 'wifi'     },
  { name: '55" Smart TV',      icon: 'tv'       },
  { name: 'Inverter AC',       icon: 'wind'     },
  { name: 'Tea & Coffee',      icon: 'coffee'   },
  { name: 'Full Kitchen',      icon: 'utensils' },
  { name: 'Covered Parking',   icon: 'car'      },
  { name: 'Forest View',       icon: 'trees'    },
  { name: 'Rain Shower',       icon: 'shower'   },
  { name: 'Gym Access',        icon: 'dumbbell' },
  { name: 'Cafeteria',         icon: 'waves'    },
  { name: 'Curated Books',     icon: 'book'     },
  { name: '24/7 Security',     icon: 'shield'   },
] as const;

// ── Navigation Links ───────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'Suites',     href: '/#suites'    },
  { label: 'Gallery',    href: '/#gallery'   },
  { label: 'Amenities',  href: '/#amenities' },
  { label: 'Reviews',    href: '/#reviews'   },
  { label: 'FAQ',        href: '/#faq'       },
  { label: 'Blog',       href: '/blog'       },
  { label: 'Book',       href: '/#book',     cta: true },
] as const;

// ── Quick Metrics (hero stats bar) ────────────────────────────
export const QUICK_METRICS = [
  { value: 'Studio',    label: 'Open-plan layout' },
  { value: '4 guests',  label: 'Max capacity'     },
  { value: '500 sq ft', label: 'Total area'       },
  { value: 'Floor 14',  label: 'High-rise views'  },
] as const;

// ── n8n Webhook Configuration ──────────────────────────────────
// Future Beds24: add BEDS24_API_KEY and BEDS24_WEBHOOK_SECRET here.
export const WEBHOOKS = {
  inquiry:  import.meta.env.N8N_INQUIRY_WEBHOOK_URL  ?? '',
  confirm:  import.meta.env.N8N_CONFIRM_WEBHOOK_URL  ?? '',
} as const;
