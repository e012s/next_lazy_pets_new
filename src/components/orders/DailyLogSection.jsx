"use client";

import { usePhotoBrowser } from "@/components/PhotoBrowser/PhotoBrowserProvider";
import { MediaSwiperRow } from "@/components/orders/MediaSwiperRow";

export function DailyLogSection({ logs }) {
  const { open } = usePhotoBrowser();
  if (!logs?.length) return null;

  const reportCount = logs.length;

  return (
    <section className="overflow-hidden rounded-[8px] border border-[#c6ccd2] bg-white px-4 py-4">
      <h3 className="text-[14px] font-bold text-[#4d5257]">每日日誌</h3>
      <p className="mt-1 text-[14px] leading-5 text-[#797979]">已發送報告 · {reportCount} 份</p>
      <div className="mt-3 divide-y divide-[#eef0f3]">
        {logs.map((entry, entryIndex) => (
          <div key={`${entry.dateLabel}-${entryIndex}`} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[14px] font-bold text-[#4d5257]">
                {entry.dateLabel}
                {entry.dateNote ? (
                  <span className="font-normal text-[#797979]"> {entry.dateNote}</span>
                ) : null}
              </p>
              {entry.updateBadge ? (
                <span className="shrink-0 rounded-full bg-[#eef0f2] px-2 py-0.5 text-[11px] font-medium text-[#797979]">
                  {entry.updateBadge}
                </span>
              ) : null}
            </div>
            <MediaSwiperRow media={entry.media} onOpen={open} />
            {entry.body ? (
              <p className="mt-2.5 text-[13px] leading-5 text-[#4d5257]">{entry.body}</p>
            ) : null}
            {entry.footer ? (
              <p className="mt-2 text-[12px] text-[#797979]">{entry.footer}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
