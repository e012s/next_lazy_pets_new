"use client";

import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { MediaTile, mediaItemSources } from "@/components/orders/dailyLogMedia";

import "swiper/css";

/** Horizontal media strip — used per day (pets) or full gallery (repair). */
export function MediaSwiperRow({ media, onOpen, className = "mt-2.5" }) {
  const items = media ?? [];
  if (items.length === 0) return null;

  const sources = mediaItemSources(items);

  return (
    <div className={`overflow-hidden ${className}`}>
      <Swiper
        modules={[FreeMode]}
        className="!overflow-hidden"
        spaceBetween={8}
        slidesPerView={3.15}
        freeMode={{ enabled: true, momentumRatio: 0.4 }}
      >
        {items.map((item, index) => (
          <SwiperSlide key={`${item.src ?? "empty"}-${index}`} className="!h-auto">
            <MediaTile
              item={item}
              sources={sources}
              index={index}
              onOpen={onOpen}
              className="w-full"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
