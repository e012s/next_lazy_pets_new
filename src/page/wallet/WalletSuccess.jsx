"use client";
import { iconSrc } from "@/icons/sources";

import { useMemo } from "react";
import { mockTopUpTransaction } from "@/service/mock/wallet";
import { money } from "@/lib/format";
import { navigate } from "@/lib/navigation";

function ReceiptRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-[14px] leading-[21px] text-[#797979]">{label}</span>
      <span className="min-w-0 text-right text-[14px] font-medium leading-[21px] text-[#4d5257]">
        {value}
      </span>
    </div>
  );
}

export default function WalletSuccess({
  amount = 300,
  nextBalance = 470,
  paymentLabel = "信用卡 •••• 4242",
}) {
  const { time, id } = useMemo(() => mockTopUpTransaction(), []);

  return (
    <div className="bg-[#f9fafc] px-[15px] pb-8 pt-[30px]">
      <div className="flex flex-col items-center pt-2.5">
        <img src={iconSrc["wallet-success"]} alt="" aria-hidden className="inline-block object-contain size-[70px]" />
        <h2 className="mt-2.5 text-center text-[22px] font-bold leading-[30px] text-[#4d5257]">
          增值成功！
        </h2>
        <p className="mt-2.5 text-center text-[14px] leading-[21px] text-[#797979]">
          {money(amount)} 已存入你的儲值金
        </p>
      </div>

      <section className="mt-6 rounded-[10px] border border-[#c8cbcf] bg-white px-5 pt-5">
        <div className="flex flex-col gap-3">
          <ReceiptRow label="付款方式" value={paymentLabel} />
          <ReceiptRow label="交易時間" value={time} />
          <ReceiptRow label="交易編號" value={id} />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-[#eef1f4] pt-[22px] pb-[13px]">
          <span className="text-[14px] font-bold leading-[21px] text-[#4d5257]">目前餘額</span>
          <span className="text-[28px] font-bold leading-[33px] text-brand">
            {money(nextBalance)}
          </span>
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate("/", "replace")}
          className="inline-flex h-12 w-full items-center justify-center gap-1 rounded-xl bg-brand px-4 text-[16px] font-bold leading-6 text-white transition active:bg-brand-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          返回報價
          <span aria-hidden className="text-[16px] font-bold leading-none">
            &gt;
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate("/balance", "replace")}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-brand bg-white px-4 text-[14px] font-medium leading-[21px] text-brand transition active:bg-brand-outline-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          查看儲值金紀錄
        </button>
      </div>
    </div>
  );
}
