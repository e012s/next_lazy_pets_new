"use client";

import { navigate } from "@/lib/navigation";

export default function AppError({ reset }) {
  return (
    <div className="px-6 py-16 text-center">
      <h1 className="text-xl font-medium text-[#4d5257]">這個頁面載入唔到</h1>
      <p className="mt-2 text-sm text-[#797979]">可以再試一次，或者返回主頁。</p>
      <div className="mt-6 space-y-3">
        <button
          type="button"
          className="inline-flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand px-4 text-title font-medium text-white transition active:bg-brand-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={reset}
        >
          再試一次
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-brand bg-white px-4 text-title font-medium text-brand transition active:bg-brand-outline-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          尋找任務
        </button>
      </div>
    </div>
  );
}
