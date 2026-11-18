"use client";

import { useEffect, useRef, useState } from "react";

export const videoRe = /\.(mov|mp4|webm|m4v)(\?|$)/i;

/** @param {Array<{ src?: string; type?: string }>} media */
export function mediaItemSources(media) {
  return (media ?? []).map((m) => m.src).filter(Boolean);
}

/** Inline muted video loads metadata so the tile shows a frame before opening the browser. */
export function VideoThumbnail({ src, duration, playIconClass = "size-10" }) {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || failed) return;

    const seekToPreview = () => {
      try {
        const t = Number.isFinite(el.duration) && el.duration > 0 ? Math.min(0.05, el.duration * 0.01) : 0.01;
        if (el.currentTime < t) el.currentTime = t;
      } catch {
        /* ignore seek errors before metadata */
      }
    };

    el.addEventListener("loadeddata", seekToPreview);
    el.addEventListener("loadedmetadata", seekToPreview);
    return () => {
      el.removeEventListener("loadeddata", seekToPreview);
      el.removeEventListener("loadedmetadata", seekToPreview);
    };
  }, [src, failed]);

  return (
    <>
      {!failed ? (
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="metadata"
          aria-hidden
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[#4d5257]" aria-hidden />
      )}
      <span className="absolute inset-0 bg-black/20" aria-hidden />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span
          className={`flex ${playIconClass} items-center justify-center rounded-full bg-white/90 shadow-sm`}
        >
          <i className="f7-icons size-5 text-[#4d5257]" aria-hidden>
            play_fill
          </i>
        </span>
      </span>
      {duration ? (
        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {duration}
        </span>
      ) : null}
    </>
  );
}

export function MediaTile({ item, sources, index, onOpen, className = "" }) {
  const isVideo = item.type === "video" || videoRe.test(item.src ?? "");
  const sourceIndex = Math.max(
    0,
    sources.findIndex((s) => s === item.src),
  );
  const openIndex = item.src ? sourceIndex : index;

  return (
    <button
      type="button"
      aria-label={isVideo ? "播放影片" : `查看相片 ${index + 1}`}
      onClick={() => onOpen(sources, openIndex >= 0 ? openIndex : index)}
      className={`relative aspect-square overflow-hidden rounded-[6px] bg-[#e6e9ee] active:opacity-90 ${className}`}
    >
      {isVideo && item.src ? (
        <VideoThumbnail src={item.src} duration={item.duration} />
      ) : item.src ? (
        <img src={item.src} alt="" className="size-full object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center text-[12px] text-[#797979]">相片</span>
      )}
    </button>
  );
}
