"use client";

import { useState } from "react";
import { openGuestWhatsApp } from "@/service/orders/guestWhatsApp";

const defaultClassName =
  "inline-flex h-[44px] w-full items-center justify-center rounded-[8px] border border-[#0091b2] bg-white px-4 text-[16px] font-bold text-[#0091b2] transition active:bg-brand-outline-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50";

/**
 * 聯絡客人 — opens WhatsApp using `supplier_order_guest_whatsapp` (phone fallback).
 */
export function ContactGuestLink({
  orderId,
  phoneNumber,
  className = defaultClassName,
  children = "聯絡客人",
}) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy || !orderId) return;
    setBusy(true);
    try {
      await openGuestWhatsApp({ orderId, phoneNumber });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className={className} disabled={busy || !orderId} onClick={handleClick}>
      {busy ? "開啟中…" : children}
    </button>
  );
}
