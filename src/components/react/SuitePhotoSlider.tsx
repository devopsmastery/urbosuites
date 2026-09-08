/**
 * SuitePhotoSlider.tsx
 * ─────────────────────────────────────────────────────────────
 * Touch-swipeable Embla carousel for suite photos.
 * Click-to-enlarge fullscreen Lightbox modal with carousel slider,
 * keyboard navigation (Esc, Arrow keys), touch swipe, and thumbnail strip.
 *
 * Hydration: client:idle
 * ─────────────────────────────────────────────────────────────
 */
import { useCallback, useEffect, useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface Photo {
  src: string;
  width: number;
  height: number;
  format: string;
}

interface Props {
  photos: Photo[];
  suiteName: string;
}

export default function SuitePhotoSlider({ photos, suiteName }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Touch swipe refs for lightbox
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  // Open Lightbox synced to current photo
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    emblaApi?.scrollTo(lightboxIndex);
  }, [emblaApi, lightboxIndex]);

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const lightboxNext = useCallback(() => {
    setLightboxIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
    };

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, closeLightbox, lightboxPrev, lightboxNext]);

  // Touch gestures for Lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        lightboxNext();
      } else {
        lightboxPrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!photos.length) return null;

  return (
    <>
      {/* ── CARD PHOTO CAROUSEL ────────────────────────────────────────── */}
      <div
        className="group relative overflow-hidden bg-gray-100 rounded-2xl cursor-zoom-in"
        style={{ aspectRatio: '4/3' }}
      >
        {/* Embla Viewport */}
        <div ref={emblaRef} className="overflow-hidden h-full">
          <div className="flex h-full touch-pan-y">
            {photos.map((photo, i) => (
              <div
                key={i}
                className="relative flex-[0_0_100%] min-w-0 h-full"
                onClick={() => openLightbox(i)}
                role="button"
                tabIndex={0}
                aria-label={`View enlarged photo ${i + 1} of ${suiteName}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') openLightbox(i);
                }}
              >
                <img
                  src={photo.src}
                  alt={`${suiteName} — photo ${i + 1} of ${photos.length}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  width={photo.width}
                  height={photo.height}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hover Enlarge Hint Badge */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openLightbox(selectedIndex);
          }}
          className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 text-white/90 text-[11px] font-medium backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80"
          aria-label="Enlarge photo"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          <span>Enlarge</span>
        </button>

        {/* Prev Arrow */}
        {canScrollPrev && (
          <button
            type="button"
            onClick={scrollPrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:scale-105 transition-transform duration-200"
            aria-label="Previous photo"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111827"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}

        {/* Next Arrow */}
        {canScrollNext && (
          <button
            type="button"
            onClick={scrollNext}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:scale-105 transition-transform duration-200"
            aria-label="Next photo"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111827"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Dot Indicators */}
        {photos.length > 1 && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 px-2 py-1 rounded-full bg-black/30 backdrop-blur-xs"
            role="tablist"
            aria-label="Photo navigation"
          >
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === selectedIndex}
                aria-label={`Photo ${i + 1}`}
                onClick={(e) => scrollTo(e, i)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === selectedIndex ? '14px' : '5px',
                  height: '5px',
                  backgroundColor: i === selectedIndex ? '#C9A227' : 'rgba(255,255,255,0.6)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── FULLSCREEN LIGHTBOX MODAL WITH SLIDER ──────────────────────── */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-between p-4 md:p-6 select-none animate-in fade-in duration-200"
          style={{
            background: 'rgba(10, 15, 29, 0.97)',
            backdropFilter: 'blur(20px)',
          }}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`${suiteName} photo viewer`}
        >
          {/* Top Bar: Title, Counter, and Close */}
          <div
            className="flex items-center justify-between w-full max-w-6xl mx-auto z-20 pb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: '#C9A227', fontFamily: "'Raleway', sans-serif" }}
              >
                {suiteName}
              </span>
              <span className="text-white/60 text-xs mt-0.5 hidden sm:inline-block">
                Press Left/Right arrows or swipe to navigate · Esc to close
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Counter Badge */}
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium border border-white/15">
                {lightboxIndex + 1} / {photos.length}
              </span>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/20"
                aria-label="Close photo window"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Center Stage: Large Image & Floating Navigation Arrows */}
          <div
            className="relative flex-1 flex items-center justify-center w-full max-w-6xl mx-auto my-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Prev Big Arrow */}
            <button
              type="button"
              onClick={lightboxPrev}
              className="absolute left-2 md:left-4 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all border border-white/20 hover:scale-105"
              aria-label="Previous picture"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {/* Display Large Image */}
            <div className="relative max-h-[72vh] max-w-[92vw] flex items-center justify-center">
              <img
                src={photos[lightboxIndex].src}
                alt={`${suiteName} photo ${lightboxIndex + 1}`}
                className="max-h-[72vh] max-w-[92vw] w-auto h-auto object-contain rounded-xl shadow-2xl transition-all duration-300"
              />
            </div>

            {/* Next Big Arrow */}
            <button
              type="button"
              onClick={lightboxNext}
              className="absolute right-2 md:right-4 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all border border-white/20 hover:scale-105"
              aria-label="Next picture"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Bottom Thumbnail Strip for Fast Seeking */}
          <div
            className="w-full max-w-4xl mx-auto z-20 pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-2 overflow-x-auto py-2 px-1 justify-start md:justify-center scrollbar-none">
              {photos.map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`shrink-0 w-14 h-10 md:w-16 md:h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                    idx === lightboxIndex
                      ? 'ring-2 ring-[#C9A227] scale-105 opacity-100 shadow-lg'
                      : 'opacity-40 hover:opacity-80'
                  }`}
                  aria-label={`Jump to photo ${idx + 1}`}
                >
                  <img
                    src={photo.src}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
