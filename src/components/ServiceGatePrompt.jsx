"use client";

import { navigate } from "@/lib/navigation";

/** Shown when `data.service === false` from the new-orders pool API. */
export function ServiceGatePrompt({
  message = "您尚未開啟此服務",
  applyHref,
  className = "",
}) {
  return (
    <div
      className={`rounded-2xl bg-white px-4 py-10 text-center shadow-[0_8px_24px_rgba(77,82,87,0.06)]${className}`}
    >
      <p className="text-sm text-[#797979]">{message}</p>
      {applyHref ? (
        <button
          type="button"
          onClick={() => navigate(applyHref)}
          className="mx-auto mt-6 inline-flex h-11 w-full max-w-xs items-center justify-center rounded-xl bg-brand px-4 text-title font-medium text-white transition active:bg-brand-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          申請開通
        </button>
      ) : null}
    </div>
  );
}