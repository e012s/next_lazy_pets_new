"use client";

import { navigate } from "@/lib/navigation";

export default function AppNotFound() {
  return (
    <div className="px-6 py-16 text-center">
      <h1 className="text-xl font-medium text-[#4d5257]">找不到這張訂單</h1>
      <p className="mt-2 text-sm text-[#797979]">編號不在樣本入面。</p>
      <button
        type="button"
        onClick={() => navigate("/")}
        className={`inline-flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand px-4 text-title font-medium text-white transition active:bg-brand-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand mt-6`}
      >
        返回主頁
      </button>
    </div>
  );
}
