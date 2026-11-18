"use client";
import { iconSrc } from "@/icons/sources";

import { mockPhotosForCount } from "@/service/mock/media";
import { usePhotoBrowser } from "@/components/PhotoBrowser/PhotoBrowserProvider";

/** Order-detail and report photo grids — tap to open themed zoom browser. */
export function PhotoRow({ count = 0, photos, label = "相關相片 / 影片", className }) {
  const { open } = usePhotoBrowser();
  const sources = photos?.length ? photos : mockPhotosForCount(count);
  if (sources.length === 0) return null;

  return (
    <div className={className}>
      <div className="mb-2 flex items-center gap-2">
        <img src={iconSrc["order-image"]} alt="" aria-hidden className="inline-block object-contain size-4 shrink-0" />
        <p className="text-[14px] font-bold">{label}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 pl-7">
        {sources.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            aria-label={`查看相片 ${index + 1}`}
            onClick={() => open(sources, index)}
            className="aspect-[1/1] overflow-hidden rounded-lg bg-[#e6e9ee] ring-0 active:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <img src={src} alt="" className="pointer-events-none size-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
