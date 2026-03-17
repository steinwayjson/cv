import { memo, useRef, useCallback } from "react";
import { GalleryImage } from "@/data/portfolioData";

interface BeforeAfterProps {
  before: GalleryImage;
  after: GalleryImage;
}

/**
 * Before/After slider using clip-path (GPU-accelerated).
 * No ResizeObserver, no extra state — position tracked via ref + direct DOM update.
 */
export const BeforeAfter = memo(function BeforeAfter({ before, after }: BeforeAfterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const beforeRef = useRef<HTMLImageElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  /** Direct DOM update — zero re-renders while dragging */
  const applyPosition = useCallback((pct: number) => {
    if (beforeRef.current) {
      beforeRef.current.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    }
    if (dividerRef.current) {
      dividerRef.current.style.left = `${pct}%`;
    }
  }, []);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    applyPosition((x / rect.width) * 100);
  }, [applyPosition]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        role="slider"
        aria-label="Сравнение до и после"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={50}
        tabIndex={0}
        className="relative w-full cursor-col-resize select-none overflow-hidden rounded-xl bg-gray-100"
        style={{ aspectRatio: "4/3" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={(e) => {
          const container = containerRef.current;
          if (!container) return;
          const rect = container.getBoundingClientRect();
          const divider = dividerRef.current;
          if (!divider) return;
          const currentPct = (parseFloat(divider.style.left) || 50);
          if (e.key === "ArrowLeft") applyPosition(Math.max(0, currentPct - 2));
          if (e.key === "ArrowRight") applyPosition(Math.min(100, currentPct + 2));
        }}
      >
        {/* After (full background) */}
        <img
          src={after.src}
          alt={after.caption ?? "После"}
          loading="lazy"
          decoding="async"
          width={1200}
          height={900}
          className="absolute inset-0 h-full w-full object-contain sm:object-cover bg-gray-100"
          draggable={false}
        />

        {/* Before (clip-path — no extra wrapper, no ResizeObserver) */}
        <img
          ref={beforeRef}
          src={before.src}
          alt={before.caption ?? "До"}
          loading="lazy"
          decoding="async"
          width={1200}
          height={900}
          className="absolute inset-0 h-full w-full object-contain sm:object-cover bg-gray-100"
          style={{ clipPath: "inset(0 50% 0 0)" }}
          draggable={false}
        />

        {/* Divider */}
        <div
          ref={dividerRef}
          className="absolute top-0 bottom-0 z-10 w-0.5 bg-white shadow-lg"
          style={{ left: "50%" }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-2.5 shadow-lg md:p-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-700" aria-hidden="true">
              <path d="M7 4L3 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 4L17 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute left-3 top-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-sm">
          До
        </div>
        <div className="absolute right-3 top-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-sm">
          После
        </div>

      </div>
    </div>
  );
});
