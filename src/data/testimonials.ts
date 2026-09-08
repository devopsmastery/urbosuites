/**
 * src/data/testimonials.ts
 * ─────────────────────────────────────────────────────────────
 * EDIT THIS FILE to update guest reviews on the website.
 * Changes here are reflected on the homepage automatically
 * after the next build (or instantly in dev mode).
 *
 * Fields:
 *   name       — Guest's display name
 *   city       — City they're from
 *   rating     — Star rating (1–5)
 *   date       — Month and year of stay
 *   text       — Review text (keep under 200 chars for best layout)
 *   platform   — Where review was posted: 'airbnb' | 'direct' | 'google'
 *   verified   — Whether it's a verified stay
 * ─────────────────────────────────────────────────────────────
 */

export interface Testimonial {
  name: string;
  city: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  text: string;
  platform: 'airbnb' | 'direct' | 'google';
  verified: boolean;
  suite?: 'Hillcrest' | 'Gulmohar'; // optional — leave out to show for both
}

export const testimonials: Testimonial[] = [
  {
    name: 'Sneha Rao',
    city: 'Hyderabad',
    rating: 5,
    date: 'Aug 2026',
    suite: 'Hillcrest',
    platform: 'airbnb',
    verified: true,
    text: 'Woke up to steaming chai and an unbelievable green view. The space is SO thoughtfully done — feels like a five-star without the five-star stiffness. Will definitely return.',
  },
  {
    name: 'Arjun Mathews',
    city: 'Bangalore',
    rating: 5,
    date: 'July 2026',
    suite: 'Hillcrest',
    platform: 'airbnb',
    verified: true,
    text: 'Stayed for a work trip and ended up extending by two days. The Murphy bed mechanism is smooth, the kitchen has everything, and the AC is gloriously cold.',
  },
  {
    name: 'Divya & Kiran',
    city: 'Pune',
    rating: 5,
    date: 'Aug 2026',
    suite: 'Gulmohar',
    platform: 'airbnb',
    verified: true,
    text: 'Perfect anniversary getaway. The balcony view in the morning mist was genuinely magical. Hosts were responsive and the apartment was exactly as photographed.',
  },
];
