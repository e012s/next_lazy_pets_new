"use client";
import { iconSrc } from "@/icons/sources";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom } from "swiper/modules";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

import "swiper/css";
import "swiper/css/zoom";
import "./photo-browser.css";

function isVideoSource(src) {
  return /\.(mov|mp4|webm|m4v)(\?|$)/i.test(String(src ?? ""));
}

/**
 * @param {{ open: boolean; index: number; sources: string[]; onClose: () => void }} props
 */
export function PhotoBrowser({ open, index, sources, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(index);
  const [swiper, setSwiper] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setActiveIndex(index);
  }, [open, index]);

  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") swiper?.slidePrev();
      if (event.key === "ArrowRight") swiper?.slideNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, swiper]);

  if (!mounted || !open || sources.length === 0) return null;

  const multi = sources.length > 1;
  const atStart = activeIndex <= 0;
  const atEnd = activeIndex >= sources.length - 1;

  return createPortal(
    <div
      className="photo-browser fixed inset-0 z-[200] flex justify-center pt-[env(safe-area-inset-top)]"
      role="dialog"
      aria-modal="true"
      aria-label="相片瀏覽"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#102028]/50 backdrop-blur-[2px]"
        aria-label="關閉相片瀏覽"
        onClick={onClose}
      />

      <div className="relative flex h-full w-full max-w-[500px] flex-col bg-background shadow-[0_0_48px_rgba(16,40,48,0.12)]">
        <header className="relative z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line bg-card px-4 shadow-[0_3px_6px_rgba(16,40,48,0.06)]">
          <div className="min-w-0">
            <p className="text-nav font-medium text-foreground">
              {isVideoSource(sources[activeIndex]) ? "影片" : "相片"}
            </p>
            <p className="text-caption tabular-nums text-brand">
              {activeIndex + 1} / {sources.length}
            </p>
          </div>
          <button
            type="button"
            aria-label="關閉"
            onClick={onClose}
            className="inline-flex shrink-0 items-center justify-center text-muted"
          >
            <img src={iconSrc["close"]} alt="" aria-hidden className="inline-block object-contain size-6" />
          </button>
        </header>

        <div className="relative min-h-0 flex-1 bg-[#eef1f4] px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="relative h-full overflow-hidden rounded-2xl border border-[#c6ccd2] bg-card">
            {multi ? (
              <>
                <button
                  type="button"
                  aria-label="上一張"
                  disabled={atStart}
                  onClick={() => swiper?.slidePrev()}
                  className={`photo-browser-nav absolute top-1/2 left-2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-card shadow-sm active:bg-brand-soft${atStart ? " pointer-events-none opacity-35" : ""}`}
                >
                  <i className="f7-icons size-5 rotate-180" aria-hidden>chevron_right</i>
                </button>
                <button
                  type="button"
                  aria-label="下一張"
                  disabled={atEnd}
                  onClick={() => swiper?.slideNext()}
                  className={`photo-browser-nav absolute top-1/2 right-2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-card shadow-sm active:bg-brand-soft${atEnd ? " pointer-events-none opacity-35" : ""}`}
                >
                  <i className="f7-icons size-5" aria-hidden>chevron_right</i>
                </button>
              </>
            ) : null}

            <Swiper
              key={`${sources.join("|")}-${index}`}
              className="photo-browser-swiper relative z-0 h-full w-full"
              modules={[Zoom]}
              initialSlide={index}
              zoom={{ maxRatio: 4, toggle: true }}
              spaceBetween={0}
              onSwiper={setSwiper}
              onSlideChange={(instance) => setActiveIndex(instance.activeIndex)}
            >
              {sources.map((src, slideIndex) => (
                <SwiperSlide key={`${src}-${slideIndex}`} className="bg-[#eef1f4]">
                  {isVideoSource(src) ? (
                    <div className="flex h-full w-full items-center justify-center bg-[#102028] p-4">
                      <video
                        src={src}
                        controls
                        playsInline
                        preload="metadata"
                        className="max-h-full max-w-full rounded-lg"
                      >
                        <source src={src} type="video/quicktime" />
                        <source src={src} type="video/mp4" />
                      </video>
                    </div>
                  ) : (
                    <div className="swiper-zoom-container">
                      <img src={src} alt="" className="select-none" draggable={false} />
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        <p className="shrink-0 border-t border-line bg-card px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] text-center text-caption text-muted">
          {isVideoSource(sources[activeIndex])
            ? "播放控件操作 · 按 × 關閉"
            : "雙指縮放 · 雙击放大 · 按 × 關閉"}
        </p>
      </div>
    </div>,
    document.body,
  );
}
