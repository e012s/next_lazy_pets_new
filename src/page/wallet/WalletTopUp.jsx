"use client";
import { useState } from "react";
import {
  getPromoBonusAmount,
  normalizePromoCode,
  promoMinTopUp,
  topUpChoices,
  wallet,
} from "@/service/mock/wallet";
import { money } from "@/lib/format";
import { navigate } from "@/lib/navigation";
import { RegisteredData } from "@/components/RegisteredData";
const promoMinAmountError = `優惠碼只適用於增值 $${promoMinTopUp} 或以上。`;
export default function WalletTopUp() {
  const [amount, setAmount] = useState(300);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const normalizedCode = normalizePromoCode(code);
  const codeIsValid = getPromoBonusAmount(normalizedCode) > 0;
  const bonus = applied && amount >= promoMinTopUp && codeIsValid ? getPromoBonusAmount(normalizedCode) : 0;
  const nextBalance = wallet.balance + amount + bonus;
  const promoQuery = bonus > 0 ? encodeURIComponent(normalizedCode) : "0";
  function applyCode() {
    if (!codeIsValid) {
      setApplied(false);
      setPromoError("優惠碼無效。");
      return;
    }
    if (amount < promoMinTopUp) {
      setApplied(false);
      setPromoError(promoMinAmountError);
      return;
    }
    setApplied(true);
    setPromoError("");
  }
  function selectAmount(nextAmount) {
    setAmount(nextAmount);
    if (nextAmount < promoMinTopUp) {
      setApplied(false);
      if (codeIsValid) {
        setPromoError(promoMinAmountError);
      }
      return;
    }
    if (codeIsValid) {
      setApplied(true);
      setPromoError("");
      return;
    }
    setApplied(false);
    setPromoError((prev) => (prev === promoMinAmountError ? "" : prev));
  }
  return (<div className="space-y-4 px-5 py-4">
    <RegisteredData afterRegistered="即可增值儲值金。">
      <section className="py-2 flex items-center justify-between mb-2">
        <p className="text-[14px] text-[#797979]">目前餘額</p>
        <p className="text[16px] font-bold text-foreground">{money(wallet.balance)}</p>
      </section>

      <p className="text-[14px] font-bold">選擇增值金額</p>
      <div className="grid grid-cols-2 gap-3">
        {topUpChoices.map((choice) => {
          const selected = amount === choice.amount;
          return (<button key={choice.amount} type="button" aria-pressed={selected} onClick={() => selectAmount(choice.amount)} className={`rounded-2xl border px-3 py-4 text-center${selected ? " border-[#0091b2] bg-[#0091b2]" : " border-[#e6e9ee] bg-white"}`}>
            <span className={`block text-[22px] font-bold text-foreground${selected ? " text-white" : " text-foreground"}`}>{money(choice.amount)}</span>
            <span className={`mt-1 block text-[14px] text-muted${selected ? " text-white" : " text-foreground"}`}>{choice.caption}</span>
          </button>);
        })}
      </div>
      <section className="rounded-2xl bg-white p-4">
        <p className="text-sm text-[#797979]">優惠碼</p>
        <div className="mt-2 flex gap-2">
          <input className="h-11 w-full rounded-xl border border-line bg-white px-3 text-field font-normal text-foreground outline-none placeholder:text-placeholder focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15" value={code} onChange={(event) => setCode(event.target.value)} aria-label="優惠碼" />
          <button type="button" onClick={applyCode} className="h-11 shrink-0 rounded-xl bg-[#0091b2] px-4 text-sm font-medium text-white">
            使用
          </button>
        </div>
        {bonus > 0 ? (<p className="mt-2 text-sm text-[#0091b2]">
          已套用：增值 {money(amount)} 額外送 {money(bonus)}
        </p>) : null}
        {promoError ? (<p role="alert" className="mt-2 text-sm text-[#d95959]">
          {promoError}
        </p>) : null}
      </section>
      <section className="rounded-2xl bg-white p-4 text-sm">
        <div className="flex justify-between text-[#4d5257]">
          <span>增值金額</span>
          <span>{money(amount)}</span>
        </div>
        {bonus > 0 ? (<div className="mt-2 flex justify-between text-[#0091b2]">
          <span>優惠碼贈送</span>
          <span>+{money(bonus)}</span>
        </div>) : null}
        <div className="my-3 h-px bg-[#eef1f4]" />
        <div className="flex items-end justify-between">
          <span>增值後餘額</span>
          <span className="text-xl font-bold text-[#0091b2]">{money(nextBalance)}</span>
        </div>
      </section>
      <p className="text-[12px] leading-5 text-[#797979]">儲值金只可用作報價費，不設退款或提款。</p>
      <button
        type="button"
        onClick={() => navigate(`/balance/pay?amount=${amount}&promo=${promoQuery}`)}
        className="inline-flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand px-4 text-title font-medium text-white transition active:bg-brand-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        下一步
      </button>
    </RegisteredData>
  </div>);
}
