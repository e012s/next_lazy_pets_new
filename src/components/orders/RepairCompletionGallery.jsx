"use client";

import { usePhotoBrowser } from "@/components/PhotoBrowser/PhotoBrowserProvider";
import { MediaSwiperRow } from "@/components/orders/MediaSwiperRow";

/** Flat gallery for completed repair — no daily log grouping. */
export function RepairCompletionGallery({ gallery }) {
  const { open } = usePhotoBrowser();
  const media = gallery?.media ?? [];
  if (media.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-[8px] border border-[#c6ccd2] bg-white px-4 py-4">
      <h3 className="text-[14px] font-bold text-[#4d5257]">
        {gallery.title ?? "完工相片 / 影片"}
      </h3>
      {gallery.subtitle ? (
        <p className="mt-1 text-[12px] text-[#797979]">{gallery.subtitle}</p>
      ) : null}
      <MediaSwiperRow media={media} onOpen={open} className="mt-3" />
    </section>
  );
}
