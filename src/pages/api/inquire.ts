/**
 * src/pages/api/inquire.ts
 * POST /api/inquire — Receives booking inquiry from BookingWidget,
 * writes to Supabase bookings table as 'inquiry_pending'.
 * Phase 5 will add n8n webhook dispatch here.
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';
import { calculateNights } from '../../lib/pricing';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // 1. Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ message: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const {
    suiteSlug, guestName, guestPhone, guestEmail,
    checkIn, checkOut, numGuests, specialRequests,
    totalPayable, pricePerNight,
  } = body as Record<string, string | number>;

  // 2. Basic validation
  const missing = ['suiteSlug','guestName','guestPhone','guestEmail','checkIn','checkOut']
    .filter(k => !body[k]);
  if (missing.length) {
    return new Response(JSON.stringify({ message: `Missing fields: ${missing.join(', ')}` }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const nights = calculateNights(new Date(checkIn as string), new Date(checkOut as string));
  if (nights <= 0) {
    return new Response(JSON.stringify({ message: 'Check-out must be after check-in' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Resolve suite slug → UUID
  const { data: suite, error: suiteErr } = await supabaseAdmin
    .from('suites')
    .select('id')
    .eq('slug', suiteSlug)
    .single();

  if (suiteErr || !suite) {
    return new Response(JSON.stringify({ message: 'Suite not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 4. Insert booking record
  const softBlockExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { data: booking, error: bookingErr } = await supabaseAdmin
    .from('bookings')
    .insert({
      suite_id:              suite.id,
      guest_name:            guestName,
      guest_phone:           guestPhone,
      guest_email:           guestEmail,
      check_in:              checkIn,
      check_out:             checkOut,
      num_guests:            numGuests ?? 2,
      price_per_night:       pricePerNight,
      total_payable:         totalPayable,
      status:                'inquiry_pending',
      special_requests:      specialRequests ?? null,
      soft_block_expires_at: softBlockExpiry,
      source:                'direct',
    })
    .select('id')
    .single();

  if (bookingErr) {
    console.error('[/api/inquire] Supabase error:', bookingErr);
    return new Response(JSON.stringify({ message: 'Failed to save inquiry. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 5. TODO Phase 5: Dispatch n8n webhook
  // await fetch(process.env.N8N_INQUIRY_WEBHOOK_URL!, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ bookingId: booking.id, ...body }),
  // });

  return new Response(JSON.stringify({ success: true, bookingId: booking.id }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
