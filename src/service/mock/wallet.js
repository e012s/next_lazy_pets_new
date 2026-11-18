export const quoteFee = 30;

export const topUpChoices = [
  { amount: 100, caption: "約報價3次" },
  { amount: 300, caption: "約報價10次", payCardQuoteQuota: 20 },
  { amount: 500, caption: "約16次" },
  { amount: 1000, caption: "約33次" },
];

export const paymentMethods = [
  {
    id: "card",
    label: "信用卡",
    detail: "Visa •••• 4242",
    icon: "/icons/payment-method/credit-card.svg",
  },
  {
    id: "fps",
    label: "轉數快 FPS",
    icon: "/icons/payment-method/alipay.svg",
  },
  {
    id: "alipay",
    label: "AlipayHK",
    icon: "/icons/payment-method/fps.svg",
  },
];

const ICON_TYPE_MAP = {
  1: "repair-ac",
  2: "repair-waterTap",
  3: "repair-electric",
  4: "order-topup",
  5: "reward",
};

export const wallet = {
  balance: 170,
  quoteFee,
  promoCode: ["LAZY50", "LAZY100"],
  promoBonus: {
    "LAZY50": 50,
    "LAZY100": 100,
  },
  history: [
    {
      id: "1",
      type: "1",
      kind: "quote",
      title: "報價費",
      desc: "冷氣清洗",
      order_id: "#RP31215",
      date: "2026/10/12",
      time: "14:20",
      status: "客人已檢閱",
      amount: -30,
    },
    {
      id: "2",
      type: "4",
      kind: "topup",
      title: "增值",
      desc: "信用卡",
      date: "2026/10/03",
      time: "12:30",
      amount: 300,
    },
    {
      id: "3",
      type: "1",
      kind: "quote",
      title: "報價費",
      desc: "冷氣更換",
      order_id: "#CL52345",
      date: "2026/09/23",
      time: "10:12",
      amount: -30,
    },
    {
      id: "4",
      type: "2",
      kind: "quote",
      title: "報價費",
      desc: "更換食水喉",
      order_id: "#CL52310",
      date: "2026/09/10",
      time: "18:40",
      amount: -30,
    },
    {
      id: "5",
      type: "3",
      kind: "quote",
      title: "報價費",
      desc: "水電維修",
      order_id: "#CL52360",
      date: "2026/09/05",
      time: "09:05",
      amount: -30,
    },
    {
      id: "6",
      type: "5",
      kind: "reward",
      title: "註冊贈送",
      date: "2026/08/01",
      time: "15:00",
      amount: 200,
    },
  ],
};

export function walletHistoryIconKey(type) {
  return ICON_TYPE_MAP[type] ?? "repair-ac";
}

export function walletHistoryMonthLabel(history) {
  const first = history[0]?.date;
  const match = String(first ?? "").match(/^\d{4}\/(\d{1,2})\//);
  return match ? `${Number(match[1])}月` : "";
}

export function walletQuoteEstimate(balance, fee = quoteFee) {
  if (!fee) return 0;
  return Math.floor(balance / fee);
}

export function formatWalletTimestamp(date, time) {
  const match = String(date ?? "").match(/^\d{4}\/(\d{2})\/(\d{2})$/);
  if (!match) return "";
  const stamp = String(time ?? "").slice(0, 5);
  return `${match[1]}/${match[2]} ${stamp}`;
}

export function walletHistoryPrimaryLine(row) {
  if (row.kind === "reward") return row.title;
  if (row.kind === "topup") {
    return [row.title, row.desc].filter(Boolean).join(" • ");
  }
  const parts = [row.title, row.desc, row.order_id].filter(Boolean);
  return parts.join(" • ");
}

export function formatWalletHistoryMeta(row) {
  const stamp = formatWalletTimestamp(row.date, row.time);
  if (!stamp) return row.status ?? "";
  return row.status ? `${stamp} · ${row.status}` : stamp;
}

export function walletRecentUsage(limit = 3) {
  return wallet.history.slice(0, limit);
}

export function formatWalletRecentTitle(row) {
  return [row.title, row.desc].filter(Boolean).join(" • ");
}

export function formatWalletRecentMeta(row) {
  const stamp = formatWalletTimestamp(row.date, row.time);
  return [row.order_id, stamp, row.status].filter(Boolean).join(" • ");
}

export const promoMinTopUp = 300;

export function normalizePromoCode(code) {
  return String(code ?? "").trim().toUpperCase();
}

export function getPromoBonusAmount(code) {
  const normalized = normalizePromoCode(code);
  if (!normalized) return 0;
  return wallet.promoBonus[normalized] ?? 0;
}

export function getTopUpPayCardSummary(amount, bonus = 0) {
  const choice = topUpChoices.find((item) => item.amount === amount);
  const credit = amount + bonus;
  return {
    title: "儲值卡",
    amount,
    expiryDate: "2030/10/23",
    quoteQuota:
      choice?.payCardQuoteQuota ?? walletQuoteEstimate(wallet.balance + credit, quoteFee),
  };
}

export function parseTopUp(amount, promo) {
  const parsed = Number(amount);
  const picked = topUpChoices.some((choice) => choice.amount === parsed) ? parsed : 300;
  let promoCode = "";
  if (picked >= promoMinTopUp && promo && promo !== "0") {
    promoCode =
      promo === "1" ? normalizePromoCode(wallet.promoCode[0]) : normalizePromoCode(promo);
  }
  const bonus = getPromoBonusAmount(promoCode);
  const appliedCode = bonus > 0 ? promoCode : "";
  return {
    amount: picked,
    bonus,
    promoCode: appliedCode,
    nextBalance: wallet.balance + picked + bonus,
  };
}

/** Receipt line for success screen, e.g. 信用卡 · · · · 4242 */
export function formatSuccessPaymentLabel(method) {
  if (!method) return "信用卡 •••• 4242";
  if (method.detail?.includes("••••")) {
    const [brandPart, last4 = "4242"] = method.detail.split("••••").map((s) => s.trim());
    const brand = brandPart || "信用卡";
    return `${brand} •••• ${last4}`;
  }
  return method.label ?? "信用卡";
}

export function mockTopUpTransaction(at = new Date()) {
  const y = at.getFullYear();
  const m = String(at.getMonth() + 1).padStart(2, "0");
  const d = String(at.getDate()).padStart(2, "0");
  const h = String(at.getHours()).padStart(2, "0");
  const min = String(at.getMinutes()).padStart(2, "0");
  const seq = String(1000 + (at.getTime() % 9000));
  return {
    time: `${y}/${m}/${d} ${h}:${min}`,
    id: `TU${y}${m}${d}-${seq}`,
  };
}
