import { formatStartedClock } from "@/service/orders/orderServiceFlow";

// Mapping helpers for the shared ServiceReport (pet + repair). Pure functions, safe on server.
const WEEK = ["日", "一", "二", "三", "四", "五", "六"];
const PET_KIND = { walk: "散步", groom: "美容", feed: "餵食", sit: "照顧" };

export function petName(a) {
  return (a?.subtitle ?? "").split(/[·・]/)[0]?.trim() ?? "";
}

export function petShortTitle(a) {
  if (!a) return "";
  const name = petName(a);
  const kind = PET_KIND[a.kind] ?? (a.title ?? "").replace(/^寵物/, "").split(/\s/)[0];
  return name && kind ? `${name}${kind}` : (a.title ?? "").slice(0, 8);
}

export function reportScreenTitle(short) {
  return short ? `今日服務 ・ ${short}` : "今日服務";
}

function money(n) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function petReportFields(a) {
  const parts = (a.subtitle ?? "").split(/[·・]/).map((s) => s.trim()).filter(Boolean);
  const [name, breed, size] = parts;
  const time = (a.schedule ?? "").replace(/^今日\s*/, "");
  const bannerWhen = a.id === "CL52345" ? "2026/09/06（日）09:00 – 10:00" : a.schedule ?? "";
  const shortPlace = (a.mapQuery ?? a.place ?? "").trim();
  return {
    id: a.id,
    headerTitle: reportScreenTitle(petShortTitle(a)),
    bannerWhen: bannerWhen || time,
    statusBadge: a.status === "done" ? "已完成" : a.badge ?? "進行中",
    bannerDetail: [`${breed ?? ""}${name ?? ""}`, size, shortPlace, a.payMain ? `服務酬勞 ${a.payMain}` : null]
      .filter(Boolean)
      .join(" ・ "),
    startedAt:
      a.serviceStartedAtMs != null
        ? formatStartedClock(a.serviceStartedAtMs)
        : a.id === "CL52345"
          ? "09:02"
          : (time.match(/\d{2}:\d{2}/)?.[0] ?? "09:00"),
    photoSectionTitle: "上載相片",
    photoHint: "客人即時見到",
    photoLabels: ["相片", "相片", "相片", "相片"],
    messageLabel: "給客人留言",
    messagePlaceholder: "例如：今日好精神，行咗45分鐘，飲水正常。",
    defaultMessage: a.id === "CL52345" ? "多多今日好精神，行咗45分鐘，飲水正常，落樓下公園同小狗玩咗一陣！" : "",
    footerHint: "一擊：發送相片 + 留言俾客人 → 訂單完成 → 入下月 7 號結算",
    backHref: "/orders",
    readOnly: a.status === "done",
    initialPhotos: a.id === "CL52345" ? 2 : 0,
  };
}

export function repairReportFields(o) {
  const m = (o.schedule ?? "").match(/(\d{4})\/(\d{2})\/(\d{2}).*?(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  let bannerWhen = o.schedule ?? "";
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    bannerWhen = `${m[1]}/${m[2]}/${m[3]}（${WEEK[d.getDay()]}）${m[4]} – ${m[5]}`;
  }
  const quote = Number(String(o.pay ?? "").replace(/[^\d.]/g, "")) || 0;
  const area = (o.place ?? "").slice(0, 2); // e.g. 沙田石門… → 沙田
  return {
    id: o.id,
    headerTitle: reportScreenTitle(o.title),
    bannerWhen,
    statusBadge: o.status === "done" ? "已完成" : o.id === "CL52380" ? "進行中 1:12:40" : o.badge ?? "進行中",
    bannerDetail: [o.title, area, quote ? `報價 ${money(quote)}` : null, quote ? `到手 ${money(quote * 0.8)}` : null]
      .filter(Boolean)
      .join(" ・ "),
    startedAt: o.id === "CL52380" ? "14:05" : (m?.[4] ?? "09:00"),
    photoSectionTitle: "完工相片",
    photoHint: "建議：安裝前 / 安裝後 / 型號標籤",
    photoLabels: ["安裝前", "安裝後", "型號標籤", "其他"],
    messageLabel: "完工說明",
    messagePlaceholder: "例如：已更換 1.5 匹分體機，試機正常。",
    defaultMessage: o.id === "CL52380" ? "已更換 1.5 匹分體機，試機正常，舊機已搬走。保養 12 個月。" : "",
    footerHint: "一擊：發送相片 + 說明俾客人 → 訂單完成 → 入下月 7 號結算",
    backHref: "/orders",
    readOnly: o.status === "done",
    initialPhotos: o.id === "CL52380" ? 3 : 0,
  };
}
