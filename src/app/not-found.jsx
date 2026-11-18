"use client";

import { navigate } from "@/lib/navigation";

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-[#f9fafc]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[500px] flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-medium tracking-wide text-[#0091b2]">Lazy Pets</p>
        <h1 className="mt-2 text-2xl font-medium text-[#4d5257]">找不到這個頁面</h1>
        <p className="mt-2 text-sm leading-6 text-[#797979]">
          任務、訂單、收入同專家申請都在主頁入面。
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#0091b2] px-5 text-sm font-medium text-white"
        >
          返回主頁
        </button>
      </div>
    </main>
  );
}
