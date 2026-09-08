/**
 * MobileStickyBar.tsx
 * ─────────────────────────────────────────────────────────────
 * Sticky "From ₹X/night · Book Now →" bar shown at the bottom of
 * the viewport on mobile ONLY after the user scrolls past the hero.
 * Hydration: client:load (needs scroll listener immediately)
 * ─────────────────────────────────────────────────────────────
 */
import { useEffect, useState } from 'react';

interface Props {
  price: string;   // e.g. "₹3,499"
  bookHref?: string;
}

export default function MobileStickyBar({ price, bookHref = '/#book' }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        // Show after scrolling past 80vh (past hero)
        setVisible(window.scrollY > window.innerHeight * 0.8);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4 transition-transform duration-300"
      style={{
        background:   'rgba(26,39,68,0.97)',
        backdropFilter: 'blur(12px)',
        transform:    visible ? 'translateY(0)' : 'translateY(100%)',
        borderTop:    '1px solid rgba(201,162,39,0.3)',
      }}
      aria-hidden={!visible}
    >
      <div>
        <p className="text-white/50 text-[10px] tracking-widest uppercase">Starting from</p>
        <p
          className="text-white text-lg font-bold"
          style={{ fontFamily: "'Raleway', sans-serif" }}
        >
          {price}
          <span className="text-white/50 text-xs font-normal"> / night</span>
        </p>
      </div>

      <a
        href={bookHref}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold tracking-wide transition-colors duration-200"
        style={{
          background:  '#C9A227',
          color:       '#1A2744',
          fontFamily:  "'Raleway', sans-serif",
        }}
        aria-label="Book a stay"
      >
        Book Now
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
    </div>
  );
}
