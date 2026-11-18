"use client";

import { useEffect, useState } from "react";
import { iconSrc } from "@/icons/sources";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { openGuestWhatsApp } from "@/service/orders/guestWhatsApp";

const sheetEase =
  "duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none motion-reduce:duration-0";

const rowIconSrc = {
  pin: iconSrc["order-location"],
  clock: iconSrc["order-clock"],
};

/**
 * 寄宿通知 bottom sheet
 * @param {{ notice: NonNullable<ReturnType<import("@/service/mock/boardingNotices").getBoardingNotice>>; onClose: () => void; orderId: string; phoneNumber?: string }} props
 */
export function BoardingNoticeSheet({ notice, onClose, orderId, phoneNumber }) {
  const [entered, setEntered] = useState(false);
  useLockBodyScroll(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  async function handleAction() {
    if (notice.action === "contact") {
      await openGuestWhatsApp({ orderId, phoneNumber });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <button
        type="button"
        aria-label="關閉通知"
        className={`absolute inset-0 bg-[#C4C5C9]/80 transition-opacity ${sheetEase} ${entered ? "opacity-100" : "opacity-0"
          }`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="boarding-notice-title"
        className={`absolute bottom-0 left-1/2 z-10 w-full max-w-[500px] -translate-x-1/2 rounded-t-[20px] bg-white px-5 pt-5 pb-5 shadow-[0_-8px_32px_rgba(16,40,48,0.12)] transition-transform ${sheetEase} ${entered ? "translate-y-0" : "translate-y-full"
          }`}
      >
        <button
          type="button"
          aria-label="關閉"
          onClick={onClose}
          className="absolute top-5 right-5 inline-flex size-5 items-center justify-center"
        >
          <img src={iconSrc["close"]} alt="" aria-hidden className="size-5 object-contain" />
        </button>

        <div className="flex flex-col items-center pt-6 text-center">
          <img
            src={notice.illustration}
            alt=""
            aria-hidden
            className="size-[60px] object-contain"
          />
          <h2
            id="boarding-notice-title"
            className="mt-4 text-[20px] font-bold leading-[29px] text-[#4d5257]"
          >
            {notice.title}
          </h2>
          <p className="mt-2 text-[14px] leading-5 text-[#797979]">{notice.subtitle}</p>
        </div>

        <div className="mt-[18px] rounded-[8px] border border-[#c6ccd2] bg-white p-5">
          {notice.rows.map((row, index) => (
            <div key={row.label}>
              {index > 0 ? <div className="my-3 h-px bg-[#c6ccd2]" /> : null}
              <div className="flex items-center gap-2">
                <img
                  src={rowIconSrc[row.icon] ?? iconSrc["info"]}
                  alt=""
                  aria-hidden
                  className="size-4 shrink-0 object-contain"
                />
                <p className="text-[14px] font-bold leading-5 text-[#4d5257]">{row.label}</p>
              </div>
              <p className="mt-1.5 pl-6 text-[14px] leading-5 text-[#797979]">{row.detail}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAction}
          className="mt-[18px] inline-flex h-12 w-full items-center justify-center gap-1 rounded-[8px] bg-[#0091b2] text-[16px] font-bold text-white transition active:bg-brand-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {notice.actionLabel}
          <span aria-hidden>›</span>
        </button>
      </div>
    </div>
  );
}
