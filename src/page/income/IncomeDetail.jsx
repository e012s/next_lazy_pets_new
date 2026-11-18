"use client";

import { getIncome } from "@/service/mock/income";
import { money } from "@/lib/format";
import { navigate } from "@/lib/navigation";
import { RegisterDataPrompt, useNeedsRegistration } from "@/components/RegisteredData";
export default function IncomeDetail({ id }) {
  const needsRegistration = useNeedsRegistration();
  const record = id ? getIncome(id) : undefined;
  if (needsRegistration) {
    return (
      <div className="px-5 py-4">
        <RegisterDataPrompt afterRegistered="即可查看收入明細。" />
      </div>
    );
  }
  if (!record) {
    return <p className="px-4 py-8 text-sm text-[#797979]">找不到這筆收入。</p>;
  }
  return (<div className="space-y-3 px-5 py-4">
    <section className="rounded-2xl bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] text-[#797979]">{record.when}</p>
          <h2 className="mt-1 text-lg font-medium text-[#4d5257]">{record.title}</h2>
          <p className="mt-1 text-sm text-[#797979]">{record.pet}</p>
        </div>
        <span className={record.status === "pending"
          ? " rounded-full bg-[#fdecee] px-2.5 py-1 text-xs text-[#d95959]"
          : " rounded-full bg-[#f2f4f6] px-2.5 py-1 text-xs text-[#797979]"}>
          {record.status === "pending" ? "待完成" : "已完成"}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#4d5257]">{record.summary}</p>
    </section>
    <section className="rounded-2xl bg-white p-4 text-sm">
      <div className="flex justify-between text-[#4d5257]">
        <span>訂單金額</span>
        <span>{money(record.orderAmount)}</span>
      </div>
      <div className="mt-2 flex justify-between text-[#797979]">
        <span>平台服務費</span>
        <span>-{money(record.orderAmount - record.payout)}</span>
      </div>
      <div className="my-3 h-px bg-[#eef1f4]" />
      <div className="flex items-end justify-between">
        <span>你的收入</span>
        <span className="text-xl font-bold text-[#0091b2]">
          {record.status === "pending" ? money(record.payout) : `+${money(record.payout)}`}
        </span>
      </div>
      <p className="mt-2 text-[12px] text-[#797979]">
        {record.payoutNote ??
          (record.status === "pending"
            ? "未完成的次數未入帳，所以仍然是待完成。"
            : "已計入 10 月結單，11月7日以 FPS 發放。")}
      </p>
    </section>
    {record.id === "inc-cl52301" ? (<button type="button" onClick={() => navigate("/orders/CL52301")} className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-brand bg-white px-4 text-title font-medium text-brand transition active:bg-brand-outline-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
      查看已完成訂單
    </button>) : null}
    <button type="button" onClick={() => navigate("/income")} className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-brand bg-white px-4 text-title font-medium text-brand transition active:bg-brand-outline-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
      返回我的收入
    </button>
  </div>);
}
