"use client";

import { wallet } from "@/service/mock/wallet";
import { money } from "@/lib/format";
import { navigate } from "@/lib/navigation";

const balanceLabelClass = "text-chip font-bold text-brand";

export function BalanceBar({ showTopUp = true }) {
  const amount = (
    <button
      type="button"
      onClick={() => navigate("/balance")}
      className="text-[22px] font-bold leading-none text-brand"
    >
      {money(wallet.balance)}
    </button>
  );

  if (!showTopUp) {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className={balanceLabelClass}>儲值金餘額</span>
        {amount}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span className={balanceLabelClass}>儲值金餘額</span>
      <div className="flex shrink-0 items-center gap-2">
        {amount}
        <button
          type="button"
          onClick={() => navigate("/balance")}
          className="inline-flex h-8 items-center rounded-lg bg-brand px-3 text-chip font-medium text-white"
        >
          + 增值
        </button>
      </div>
    </div>
  );
}
