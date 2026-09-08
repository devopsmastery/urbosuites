/**
 * src/lib/pricing.ts
 * ─────────────────────────────────────────────────────────────
 * Date range calculation and total payable formulas.
 * Pure functions — no side effects, no external dependencies.
 * Safe to import in both Astro components and React islands.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Calculate the number of nights between two dates.
 * Uses UTC midnight to avoid daylight saving time issues.
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utcIn    = Date.UTC(checkIn.getFullYear(),  checkIn.getMonth(),  checkIn.getDate());
  const utcOut   = Date.UTC(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
  return Math.max(0, Math.round((utcOut - utcIn) / msPerDay));
}

/**
 * Calculate total payable amount in INR.
 * Currently: pricePerNight × nights (no taxes / platform fees).
 * Future: add dynamic pricing, seasonal rates, or discount codes.
 */
export function calculateTotal(pricePerNight: number, nights: number): number {
  return pricePerNight * nights;
}

/**
 * Format an INR amount with ₹ symbol and Indian number formatting.
 * e.g. 11097 → "₹11,097"
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate a UPI payment deep-link URL.
 * The link opens the UPI app on the guest's phone when tapped on WhatsApp.
 *
 * @param vpa     - UPI Virtual Payment Address  (e.g. "urbosuites@upi")
 * @param name    - Payee display name            (e.g. "UrboSuites")
 * @param amount  - Amount in INR                (e.g. 11097)
 * @param ref     - Transaction reference        (e.g. "URBO-101-2026-10-12")
 */
export function buildUpiLink(
  vpa: string,
  name: string,
  amount: number,
  ref: string,
): string {
  const params = new URLSearchParams({
    pa:  vpa,
    pn:  name,
    am:  amount.toFixed(2),
    tr:  ref,
    tn:  `Booking at ${name}`,
    cu:  'INR',
  });
  return `upi://pay?${params.toString()}`;
}

/**
 * Build a booking reference string.
 * e.g. suiteNumber=101, checkIn=2026-10-12 → "URBO-101-20261012"
 */
export function buildBookingRef(suiteNumber: string, checkIn: Date): string {
  const date = checkIn.toISOString().slice(0, 10).replace(/-/g, '');
  return `URBO-${suiteNumber}-${date}`;
}

/**
 * Format a date as a short display string for WhatsApp / UI.
 * e.g. 2026-10-12 → "12 Oct 2026"
 */
export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}
