"use client";

import { useState } from "react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-white px-3 text-field font-normal text-foreground outline-none placeholder:text-placeholder focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15";

function digitsOnly(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function formatCardNumber(value) {
  const digits = digitsOnly(value).slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExpiry(value) {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 1) return digits;
  if (digits.length === 2) {
    const mm = Number(digits);
    if (mm === 0) return digits.slice(0, 1);
    if (mm > 12) return digits.slice(0, 1);
    return digits;
  }
  let mm = Number(digits.slice(0, 2));
  if (mm < 1) mm = 1;
  if (mm > 12) mm = 12;
  const month = String(mm).padStart(2, "0");
  return `${month}/${digits.slice(2)}`;
}

function cardBrand(digits) {
  if (digits.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "Mastercard";
  return "信用卡";
}

function cardDetailFromDigits(digits) {
  const last4 = digits.slice(-4);
  if (last4.length < 4) return "信用卡";
  return `${cardBrand(digits)} •••• ${last4}`;
}

function expiryValid(expiry) {
  const match = String(expiry).match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  const yy = Number(match[2]);
  if (month < 1 || month > 12) return false;
  if (Number.isNaN(yy)) return false;
  const year = 2000 + yy;
  const now = new Date();
  const monthStart = new Date(year, month - 1, 1);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return monthStart >= thisMonthStart;
}

/**
 * @param {{ onClose: () => void; onAdded: (method: { id: string; label: string; detail: string; icon: string }) => void }} props
 */
export function AddCreditCardSheet({ onClose, onAdded }) {
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useLockBodyScroll(true);

  function submit(event) {
    event.preventDefault();
    const digits = digitsOnly(number);
    const cvcDigits = digitsOnly(cvc);

    if (digits.length < 13) {
      setError("請輸入有效的信用卡號碼。");
      return;
    }
    if (!expiryValid(expiry)) {
      const mm = Number(digitsOnly(expiry).slice(0, 2));
      if (mm > 12 || mm < 1) {
        setError("月份須為 01 至 12。");
      } else {
        setError("請輸入有效的到期日（MM/YY），且不可早於本月。");
      }
      return;
    }
    if (cvcDigits.length < 3 || cvcDigits.length > 4) {
      setError("請輸入有效的安全碼（CVC）。");
      return;
    }
    if (!name.trim()) {
      setError("請輸入持卡人姓名。");
      return;
    }

    const last4 = digits.slice(-4);
    onAdded({
      id: `card-${last4}-${Date.now()}`,
      label: "信用卡",
      detail: cardDetailFromDigits(digits),
      icon: "/icons/payment-method/credit-card.svg",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-[#102028]/40"
        aria-label="關閉"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-card-title"
        className="absolute bottom-0 left-1/2 w-full max-w-[500px] -translate-x-1/2 rounded-t-2xl bg-white px-5 pb-8 pt-4 shadow-[0_-8px_32px_rgba(16,40,48,0.12)]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#e6e9ee]" aria-hidden />
        <h2 id="add-card-title" className="text-[17px] font-medium text-[#4d5257]">
          新增信用卡
        </h2>
        <p className="mt-1 text-[13px] text-[#797979]">資料只會用於本次增值付款（示範）。</p>

        <form className="mt-5 space-y-4" onSubmit={submit} autoComplete="off" noValidate>
          <div>
            <label className="text-sm text-[#797979]" htmlFor="wallet-add-card-number">
              卡號
            </label>
            <input
              id="wallet-add-card-number"
              name="wallet-add-card-number"
              className={`${inputClass} mt-1.5 tracking-wide`}
              inputMode="numeric"
              autoComplete="off"
              placeholder="1234 5678 9012 3456"
              value={number}
              onChange={(event) => {
                setNumber(formatCardNumber(event.target.value));
                setError("");
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-[#797979]" htmlFor="wallet-add-card-expiry">
                到期日
              </label>
              <input
                id="wallet-add-card-expiry"
                name="wallet-add-card-expiry"
                className={`${inputClass} mt-1.5`}
                inputMode="numeric"
                autoComplete="off"
                placeholder="MM/YY"
                value={expiry}
                onChange={(event) => {
                  setExpiry(formatExpiry(event.target.value));
                  setError("");
                }}
              />
            </div>
            <div>
              <label className="text-sm text-[#797979]" htmlFor="wallet-add-card-cvc">
                安全碼
              </label>
              <input
                id="wallet-add-card-cvc"
                name="wallet-add-card-cvc"
                className={`${inputClass} mt-1.5`}
                inputMode="numeric"
                autoComplete="off"
                placeholder="CVC"
                maxLength={4}
                value={cvc}
                onChange={(event) => {
                  setCvc(digitsOnly(event.target.value).slice(0, 4));
                  setError("");
                }}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-[#797979]" htmlFor="wallet-add-card-name">
              持卡人姓名
            </label>
            <input
              id="wallet-add-card-name"
              name="wallet-add-card-name"
              className={`${inputClass} mt-1.5`}
              autoComplete="off"
              required
              placeholder="與信用卡相同"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-[#d95959]">
              {error}
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-brand bg-white px-4 text-title font-medium text-brand transition active:bg-brand-outline-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              取消
            </button>
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-title font-medium text-white transition active:bg-brand-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
