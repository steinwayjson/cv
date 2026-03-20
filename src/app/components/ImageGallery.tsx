import { memo, useState, useCallback } from "react";
import { GallerySection, GalleryImage } from "@/data/portfolioData";
import { ImageModal } from "@/app/components/ImageModal";
import { BeforeAfterPreview } from "@/app/components/BeforeAfterPreview";
import { ZoomIn, CheckCircle2, ArrowRight } from "lucide-react";

interface ImageGalleryProps {
  galleries: GallerySection[];
}

/**
 * Gallery renderer for case pages.
 * – before-after → BeforeAfterPreview (compact, fixed height)
 * – grid / full → clickable previews opening ImageModal
 * – After each section: "Что изменили" checklist + compact result card
 */
export const ImageGallery = memo(function ImageGallery({
  galleries,
}: ImageGalleryProps) {
  const [lightbox, setLightbox] = useState<{
    images: GalleryImage[];
    index: number;
  } | null>(null);

  const openLightbox = useCallback(
    (images: GalleryImage[], index: number) => {
      setLightbox({ images, index });
    },
    []
  );

  return (
    <>
      <div className="space-y-14">
        {galleries.map((gallery, gi) => (
          <div key={gi}>
            {/* Stage heading */}
            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {gallery.title}
            </h3>

            {gallery.description && gallery.layout !== "before-after" && (
              <p className="mb-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {gallery.description}
              </p>
            )}

            {!gallery.description && gallery.layout !== "before-after" && (
              <div className="mb-4" />
            )}

            {gallery.layout === "before-after" && gallery.items.length >= 2 && (
              <div className="mx-auto mt-4 max-w-[800px]">
                <BeforeAfterPreview
                  before={gallery.items[0]}
                  after={gallery.items[1]}
                  description={gallery.description}
                />
              </div>
            )}

            {gallery.layout === "paired-compare" && gallery.items.length >= 4 && (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <div>
                  {gallery.pairLabels?.[0] && (
                    <p className="mb-2 text-[13px] font-medium text-gray-500 dark:text-gray-400">{gallery.pairLabels[0]}</p>
                  )}
                  <BeforeAfterPreview
                    before={gallery.items[0]}
                    after={gallery.items[1]}
                  />
                </div>
                <div>
                  {gallery.pairLabels?.[1] && (
                    <p className="mb-2 text-[13px] font-medium text-gray-500 dark:text-gray-400">{gallery.pairLabels[1]}</p>
                  )}
                  <BeforeAfterPreview
                    before={gallery.items[2]}
                    after={gallery.items[3]}
                  />
                </div>
              </div>
            )}

            {gallery.layout === "grid" && (
              <div className="grid grid-cols-2 gap-4">
                {gallery.items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => openLightbox(gallery.items, i)}
                    className="group relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
                  >
                    <img
                      src={item.src}
                      alt={item.caption || "Открыть изображение"}
                      loading="lazy"
                      decoding="async"
                      className="h-[240px] w-full object-cover bg-gray-100 transition-transform duration-300 group-hover:scale-105 md:h-[320px] dark:bg-gray-800"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                      <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    {item.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6">
                        <p className="text-sm text-white">{item.caption}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {gallery.layout === "full" && (
              <div className="space-y-4">
                {gallery.items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => openLightbox(gallery.items, i)}
                    className="group relative block w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
                  >
                    <img
                      src={item.src}
                      alt={item.caption || "Открыть изображение"}
                      loading="lazy"
                      decoding="async"
                      className="h-[420px] max-h-[60vh] w-full object-cover bg-gray-100 transition-transform duration-300 group-hover:scale-[1.02] md:h-[480px] md:max-h-none dark:bg-gray-800 aspect-video"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                      <ZoomIn className="h-10 w-10 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    {item.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
                        <p className="text-base text-white">{item.caption}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* "Что изменили" + "Результат" */}
            {(gallery.changes?.length || gallery.result || gallery.results?.length) && (
              <div className="mt-6 space-y-4">
                {/* Changes checklist */}
                {gallery.changes && gallery.changes.length > 0 && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-5 md:px-6 dark:border-white/8 dark:bg-gray-900">
                    <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                      Что изменили
                    </p>
                    <ul className="space-y-3">
                      {gallery.changes.map((change, ci) => (
                        <li key={ci} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-emerald-500" />
                          <span className="text-[16px] leading-[1.6] text-gray-700 dark:text-gray-300">{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Result card — single */}
                {gallery.result && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-5 md:px-6 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-600/70 dark:text-emerald-400/70">
                      Результат
                    </p>
                    <div className="flex items-baseline gap-2">
                      <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      <p className="text-[1.25rem] font-bold leading-tight text-gray-900 dark:text-gray-100">
                        {gallery.result.value}
                      </p>
                    </div>
                    <p className="mt-1.5 text-[14px] font-medium leading-snug text-gray-500 dark:text-gray-400">
                      {gallery.result.label}
                    </p>
                    {gallery.result.note && (
                      <p className="mt-1 text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {gallery.result.note}
                      </p>
                    )}
                  </div>
                )}

                {/* Results — multiple metrics */}
                {gallery.results && gallery.results.length > 0 && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-5 md:px-6 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-600/70 dark:text-emerald-400/70">
                      Результат
                    </p>
                    <div className="space-y-2.5">
                      {gallery.results.map((r, ri) => (
                        <div key={ri} className="flex items-baseline gap-2">
                          <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                          <div>
                            <span className="text-[1.1rem] font-bold leading-tight text-gray-900 dark:text-gray-100">{r.value}</span>
                            {r.note && <span className="ml-2 text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">{r.note}</span>}
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{r.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {lightbox && (
        <ImageModal
          images={lightbox.images}
          currentIndex={lightbox.index}
          onClose={() => setLightbox(null)}
          onNavigate={(index) => setLightbox({ ...lightbox, index })}
        />
      )}
    </>
  );
});
