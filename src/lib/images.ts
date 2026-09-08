/**
 * src/lib/images.ts
 * ─────────────────────────────────────────────────────────────
 * Dynamic image loader using import.meta.glob().
 *
 * KEY BEHAVIOUR: Adding a new photo to any of the three source
 * folders (src/assets/suites/hillcrest/, src/assets/suites/gulmohar/,
 * src/assets/amenities/) and rebuilding will AUTOMATICALLY include
 * it in every carousel and gallery — no code changes needed.
 *
 * Why src/assets/ and not public/?
 *   Astro can only optimize images that go through its image pipeline
 *   (i.e. files under src/). Images in public/ are served verbatim.
 *   import.meta.glob() is evaluated at build time, so new files are
 *   picked up on the next `astro build` or `astro dev` restart.
 * ─────────────────────────────────────────────────────────────
 */

// ── Hillcrest — Suite 1401 (most-selling, always shown first) ─
const hillcrestModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/suites/hillcrest/*',
  { eager: true }
);

// ── Gulmohar — Suite 611 ──────────────────────────────────────
const gulmoharModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/suites/gulmohar/*',
  { eager: true }
);

// ── Common Amenities ──────────────────────────────────────────
const amenitiesModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/amenities/*',
  { eager: true }
);

/** Extract ImageMetadata array from a glob result map. */
function extractImages(modules: Record<string, { default: ImageMetadata }>): ImageMetadata[] {
  return Object.values(modules).map((m) => m.default);
}

/** Filename without extension, lowercased — used to derive alt text. */
function fileAlt(img: ImageMetadata): string {
  return img.src
    .split('/')
    .pop()!
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Ordered image lists per property ─────────────────────────
// Hero image = first in each array (put best photo first in the folder
// by prefixing filename with "01-", "02-" etc. — sort is alphabetical).

function sortedImages(modules: Record<string, { default: ImageMetadata }>): ImageMetadata[] {
  return Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map(([, m]) => m.default);
}

export const hillcrestImages  = sortedImages(hillcrestModules);
export const gulmoharImages   = sortedImages(gulmoharModules);
export const amenitiesImages  = sortedImages(amenitiesModules);

/** Returns all images for a suite by slug. */
export function getSuiteImages(slug: string): ImageMetadata[] {
  if (slug === 'hillcrest') return hillcrestImages;
  if (slug === 'gulmohar')  return gulmoharImages;
  return [];
}

/** Hero image (first in sorted list). */
export function getHeroImage(slug: string): ImageMetadata | undefined {
  return getSuiteImages(slug)[0];
}

/** Gallery images (all except hero). */
export function getGalleryImages(slug: string): ImageMetadata[] {
  return getSuiteImages(slug).slice(1);
}

/** Alt text helper — falls back to a clean filename-derived label. */
export { fileAlt };
