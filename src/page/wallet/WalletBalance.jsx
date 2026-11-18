"use client";
import { iconSrc } from "@/icons/sources";

import {
  formatWalletHistoryMeta,
  formatWalletTimestamp,
  wallet,
  walletHistoryIconKey,
  walletHistoryMonthLabel,
  walletHistoryPrimaryLine,
  walletQuoteEstimate,
} from "@/service/mock/wallet";
import { money } from "@/lib/format";
import { navigate } from "@/lib/navigation";
import { RegisteredData } from "@/components/RegisteredData";

export default function WalletBalance() {
  const quoteTimes = walletQuoteEstimate(wallet.balance, wallet.quoteFee);

  return (
    <div className="pb-8">
      <section className="bg-[#0091b2] px-5 pb-5 pt-4 text-white">
        <p className="text-sm text-white/85">儲值金餘額</p>
        <p className="mt-1 text-[40px] font-bold leading-none tracking-tight">{money(wallet.balance)}</p>
        <p className="mt-3 text-sm text-white/90">
          約可報價 {quoteTimes} 次（每次 {money(wallet.quoteFee)}）
        </p>
        <button
          type="button"
          onClick={() => navigate("/balance/topup")}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-1 rounded-[8px] bg-white text-[15px] font-bold text-[#0091b2] transition active:opacity-90"
        >
          <i className="f7-icons size-5 font-bold text-[#0091b2]" aria-hidden>plus</i>
          增值
        </button>
      </section>

      <div className="space-y-3 px-4 pt-3">
        <div className="flex gap-2 rounded-xl bg-[#ccf5ff] px-3 py-3 text-[13px] leading-5 text-[#3d6d78]">
          <img src={iconSrc["info"]} alt="" aria-hidden className="inline-block object-contain mt-0.5 size-4 shrink-0" />
          <p>
            維修報價每次 {money(wallet.quoteFee)}，客人檢閱報價後才會扣除。寵物任務接單不扣儲值金。
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#c6ccd2] bg-white">
          <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
            <h2 className="text-sm font-bold text-[#4d5257]">儲值金紀錄</h2>
            <span className="text-xs text-[#797979]">{walletHistoryMonthLabel(wallet.history)}</span>
          </div>
          <RegisteredData afterRegistered="即可查看儲值金紀錄。" className="mx-4 mb-4 shadow-none">
            <ul>
              {wallet.history.map((row, index) => {
                const positive = row.amount > 0;
                const isLast = index === wallet.history.length - 1;
                return (
                  <li key={row.id}>
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        <img src={iconSrc[walletHistoryIconKey(row.type)]} alt="" aria-hidden className="inline-block object-contain size-10 shrink-0" />
                        <span className="min-w-0">
                          <span className="block text-sm font-bold leading-snug text-[#4d5257]">
                            {walletHistoryPrimaryLine(row)}
                          </span>
                          <span className="mt-0.5 block text-[12px] leading-4 text-[#797979]">
                            {formatWalletHistoryMeta(row)}
                          </span>
                        </span>
                      </span>
                      <span
                        className={
                          positive
                            ? " shrink-0 text-sm font-bold text-[#0091b2]"
                            : " shrink-0 text-sm font-bold text-[#4d5257]"
                        }
                      >
                        {positive ? `+${money(row.amount)}` : money(row.amount)}
                      </span>
                    </div>
                    {isLast ? null : (
                      <div className="mr-4 ml-[68px] border-b border-[#eef1f4]" aria-hidden />
                    )}
                  </li>
                );
              })}
            </ul>
          </RegisteredData>
        </section>
      </div>
    </div>
  );
}
