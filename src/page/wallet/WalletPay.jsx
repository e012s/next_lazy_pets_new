"use client";
import { iconSrc } from "@/icons/sources";

import { useMemo, useState } from "react";
import { formatSuccessPaymentLabel, paymentMethods, wallet } from "@/service/mock/wallet";
import { money } from "@/lib/format";
import { navigate } from "@/lib/navigation";
import { RegisteredData, useNeedsRegistration } from "@/components/RegisteredData";
import { AddCreditCardSheet } from "./AddCreditCardSheet";

const defaultMethodId = paymentMethods[0]?.id ?? "";

export default function WalletPay({ amount = 300, bonus = 0, promoCode = "" }) {
  const [methods, setMethods] = useState(() => [...paymentMethods]);
  const [method, setMethod] = useState(defaultMethodId);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [addCardOpen, setAddCardOpen] = useState(false);

  const nextBalance = useMemo(
    () => wallet.balance + amount + bonus,
    [amount, bonus],
  );

  const promoQuery = bonus > 0 && promoCode ? encodeURIComponent(promoCode) : "0";
  const needsRegistration = useNeedsRegistration();

  function confirmPay() {
    if (!methods.some((item) => item.id === method)) {
      setError("請選擇付款方式。");
      return;
    }
    if (!agreed) {
      setError("請先同意儲值金條款。");
      return;
    }
    const picked = methods.find((item) => item.id === method);
    const payQuery = encodeURIComponent(formatSuccessPaymentLabel(picked));
    navigate(`/balance/success?amount=${amount}&promo=${promoQuery}&pay=${payQuery}`);
  }

  function handleCardAdded(next) {
    setMethods((current) => [...current, next]);
    setMethod(next.id);
    setAddCardOpen(false);
    setError("");
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-[#f9fafc]">
      <div className="flex-1 px-5 py-4">
        <RegisteredData afterRegistered="即可增值儲值金。">
          <section className="rounded-xl border border-[#c8cbcf] bg-white px-4 py-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[15px] font-medium text-[#4d5257]">增值金額</span>
              <span className="shrink-0 text-[28px] font-bold leading-none text-brand">
                {money(amount)}
              </span>
            </div>
            <p className="text-[13px] text-[#797979]">
              增值後餘額 {money(nextBalance)}
            </p>
          </section>

          <section className="mt-5">
            <h2 className="text-[15px] font-medium text-[#4d5257]">選擇付款方式</h2>
            <fieldset className="mt-3 space-y-3">
              <legend className="sr-only">付款方式</legend>
              {methods.map((item) => {
                const selected = method === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setMethod(item.id);
                      setError("");
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 text-left transition${selected
                        ? " border-2 border-brand px-[15px] py-[13px]"
                        : " border-[#e6e9ee]"}`}
                  >
                    <img
                      src={item.icon}
                      alt=""
                      aria-hidden
                      className="size-10 shrink-0 object-contain"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium text-[#4d5257]">
                        {item.label}
                      </span>
                      {item.detail ? (
                        <span className="mt-0.5 block text-[13px] text-[#797979]">
                          {item.detail}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full border${selected
                          ? " border-brand bg-brand text-white"
                          : " border-[#cfd5dc] bg-white"}`}
                      aria-hidden
                    >
                      {selected ? (
                        <i className="f7-icons size-3 font-bold text-white" aria-hidden>checkmark</i>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </fieldset>

            <button
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-brand"
              onClick={() => setAddCardOpen(true)}
            >
              <img src={iconSrc["plus"]} alt="" aria-hidden className="inline-block object-contain size-4 text-brand" />
              新增信用卡
            </button>

            <label className="mt-5 flex items-start gap-2 text-[14px] text-[#797979]">
              <button
                type="button"
                role="checkbox"
                aria-checked={agreed}
                onClick={() => {
                  setAgreed((v) => !v);
                  setError("");
                }}
                className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border${agreed ? " border-brand bg-brand text-white" : " border-[#cfd5dc] bg-white"}`}
              >
                {agreed ? (
                  <i className="f7-icons size-3 font-bold text-white" aria-hidden>checkmark</i>
                ) : null}
              </button>
              <span>
                我同意{" "}
                <button type="button" className="font-medium text-brand">
                  儲值金條款
                </button>
              </span>
            </label>

            {error ? (
              <p role="alert" className="mt-3 text-sm text-[#d95959]">
                {error}
              </p>
            ) : null}
          </section>
        </RegisteredData>
      </div>

      <footer className="mt-auto bg-[#f9fafc] px-5 pb-5 pt-2">
        {needsRegistration ? null : (
          <button type="button" onClick={confirmPay} className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand text-[16px] font-bold text-white transition active:bg-brand-active">
            確認付款 {money(amount)}
          </button>
        )}
      </footer>
      {addCardOpen ? (
        <AddCreditCardSheet
          onClose={() => setAddCardOpen(false)}
          onAdded={handleCardAdded}
        />
      ) : null}
    </div>
  );
}
