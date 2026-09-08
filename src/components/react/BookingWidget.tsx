/**
 * BookingWidget.tsx
 * ─────────────────────────────────────────────────────────────
 * Inquiry form with date range inputs.
 * Phase 3 version: submits to Supabase via /api/inquire endpoint.
 * Phase 5 will add n8n webhook trigger.
 * Hydration: client:visible
 * ─────────────────────────────────────────────────────────────
 */
import { useState } from 'react';

interface Props {
  suites: Array<{ slug: string; title: string; pricePerNight: number }>;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function BookingWidget({ suites }: Props) {
  const [selectedSuite, setSelectedSuite] = useState(suites[0]?.slug ?? '');
  const [checkIn,  setCheckIn]  = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests,   setGuests]   = useState(2);
  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [email,    setEmail]    = useState('');
  const [note,     setNote]     = useState('');
  const [status,   setStatus]   = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const currentSuite = suites.find(s => s.slug === selectedSuite);
  const nights = checkIn && checkOut
    ? Math.max(0, Math.round(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000
      ))
    : 0;
  const total = currentSuite ? nights * currentSuite.pricePerNight : 0;

  const today = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkIn || !checkOut || nights <= 0) {
      setErrorMsg('Please select valid check-in and check-out dates.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suiteSlug: selectedSuite,
          guestName: name,
          guestPhone: phone,
          guestEmail: email,
          checkIn,
          checkOut,
          numGuests: guests,
          specialRequests: note,
          totalPayable: total,
          pricePerNight: currentSuite?.pricePerNight ?? 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Submission failed');
      }

      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: '#C9A227' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A2744" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <h3 className="text-xl font-bold" style={{ fontFamily: "'Raleway', sans-serif", color: '#111827' }}>
          Inquiry sent!
        </h3>
        <p className="text-sm max-w-xs" style={{ color: '#6B7280' }}>
          We'll confirm your dates and get back to you within 2 hours.
          Check your WhatsApp / email for updates.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-2 text-sm underline"
          style={{ color: '#C9A227' }}
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  const labelStyle = { fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#6B7280', fontWeight: 500 };
  const inputStyle = { border: '1px solid #E5E7EB', background: '#fff', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#111827', outline: 'none', width: '100%', transition: 'border-color 200ms' };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

      {/* Suite selector */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Select Suite</label>
        <select
          value={selectedSuite}
          onChange={e => setSelectedSuite(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
          required
        >
          {suites.map(s => (
            <option key={s.slug} value={s.slug}>
              {s.title} — ₹{s.pricePerNight.toLocaleString('en-IN')}/night
            </option>
          ))}
        </select>
      </div>

      {/* Dates row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label style={labelStyle}>Check-in</label>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={e => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(''); }}
            style={inputStyle}
            required
            aria-label="Check-in date"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label style={labelStyle}>Check-out</label>
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={e => setCheckOut(e.target.value)}
            style={inputStyle}
            required
            aria-label="Check-out date"
          />
        </div>
      </div>

      {/* Live price calculation */}
      {nights > 0 && (
        <div
          className="flex items-center justify-between px-4 py-3 text-sm"
          style={{ background: '#EEF0F5', borderLeft: '2px solid #C9A227' }}
        >
          <span style={{ color: '#6B7280' }}>{nights} night{nights > 1 ? 's' : ''}</span>
          <span className="font-bold" style={{ color: '#1A2744', fontFamily: "'Raleway', sans-serif" }}>
            ₹{total.toLocaleString('en-IN')} total
          </span>
        </div>
      )}

      {/* Guests */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Guests</label>
        <select
          value={guests}
          onChange={e => setGuests(Number(e.target.value))}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          {[1, 2, 3, 4].map(n => (
            <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
          ))}
        </select>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Full name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Sneha Rao"
          style={inputStyle}
          required
          aria-label="Your full name"
        />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>WhatsApp number</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          style={inputStyle}
          required
          aria-label="WhatsApp phone number"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="sneha@example.com"
          style={inputStyle}
          required
          aria-label="Email address"
        />
      </div>

      {/* Special requests */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Special requests (optional)</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Early check-in, dietary needs, occasion..."
          rows={3}
          style={{ ...inputStyle, resize: 'none' }}
          aria-label="Special requests"
        />
      </div>

      {/* Error message */}
      {errorMsg && (
        <p className="text-sm" style={{ color: '#DC2626' }} role="alert">{errorMsg}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 text-sm font-bold tracking-[0.1em] uppercase transition-colors duration-200"
        style={{
          fontFamily: "'Raleway', sans-serif",
          background: status === 'loading' ? '#6B7280' : '#1A2744',
          color: '#fff',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        }}
      >
        {status === 'loading' ? 'Sending…' : 'Send Booking Request →'}
      </button>

      <p className="text-xs text-center" style={{ color: '#6B7280' }}>
        No payment now · Free cancellation · Reply within 2 hours
      </p>
    </form>
  );
}
