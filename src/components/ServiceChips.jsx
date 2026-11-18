"use client";

import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

const items = [
  { id: "all", label: "全部服務" },
  { id: "repair", label: "維修" },
  { id: "pet", label: "寵物" },
];

export function ServiceChips({ current, onSelect }) {
  return (
    <div className="mt-4" role="tablist" aria-label="服務類型">
      <Swiper
        modules={[FreeMode]}
        spaceBetween={8}
        slidesPerView="auto"
        freeMode={{ enabled: true, momentumRatio: 0.35 }}
      >
        {items.map((item) => {
          const active = current === item.id;
          return (
            <SwiperSlide key={item.id} className="!w-auto">
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelect(item.id)}
                className={`inline-flex h-9 items-center rounded-full px-4 text-chip font-bold${active
                    ? " bg-brand text-white"
                    : " border border-[#b8c4ca] bg-white text-foreground"}`}
              >
                {item.label}
              </button>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
