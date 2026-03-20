import { memo, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { GalleryImage } from "@/data/portfolioData";

interface ImageModalProps {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/**
 * Full-screen image modal rendered via React Portal.
 * – max 90vw × 90vh
 * – darkened overlay
 * – Esc / click-outside / button to close
 * – arrow navigation
 * – body scroll lock
 */
export const ImageModal = memo(function ImageModal({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: ImageModalProps) {
  const current = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0 && hasNext) onNavigate(currentIndex + 1);
    if (dx > 0 && hasPrev) onNavigate(currentIndex - 1);
  }, [hasNext, hasPrev, onNavigate, currentIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigate(currentIndex + 1);
      if (e.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose, onNavigate, currentIndex, hasPrev, hasNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Просмотр изображения ${currentIndex + 1} из ${images.length}`}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 outline-none"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Закрыть"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <X className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Image area */}
      <div
        className="flex flex-1 max-w-[90vw] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={current.src}
          alt={current.caption ?? ""}
          decoding="async"
          className="max-h-[75vh] max-w-full rounded-lg object-contain"
        />
      </div>

      {/* Bottom bar: caption + navigation */}
      {images.length > 1 && (
        <div
          className="flex w-full items-center justify-between px-4 pb-6 pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => hasPrev && onNavigate(currentIndex - 1)}
            aria-label="Предыдущее изображение"
            className={`rounded-full bg-white/10 p-3 text-white transition-opacity hover:bg-white/20 ${hasPrev ? "" : "pointer-events-none opacity-30"}`}
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-col items-center gap-1 min-w-0 px-3">
            {current.caption && (
              <p className="text-center text-sm leading-snug text-white/80 line-clamp-2">
                {current.caption}
              </p>
            )}
            <p className="text-xs text-white/50">
              {currentIndex + 1} / {images.length}
            </p>
          </div>

          <button
            onClick={() => hasNext && onNavigate(currentIndex + 1)}
            aria-label="Следующее изображение"
            className={`rounded-full bg-white/10 p-3 text-white transition-opacity hover:bg-white/20 ${hasNext ? "" : "pointer-events-none opacity-30"}`}
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Single image caption (no nav bar) */}
      {images.length <= 1 && current.caption && (
        <div className="pb-6 pt-3 px-4" onClick={(e) => e.stopPropagation()}>
          <p className="text-center text-sm text-white/80">{current.caption}</p>
        </div>
      )}
    </div>,
    document.body
  );
});
