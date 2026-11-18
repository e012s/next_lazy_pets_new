import api from "@/lib/api/Axios.jsx";
import { loadLocale } from "@/lib/preferences";

function pickUrl(payload) {
  if (!payload || typeof payload !== "object") return null;
  const url =
    payload.whatsapp_url ??
    payload.whatsappUrl ??
    payload.whatsapp_link ??
    payload.whatsappLink ??
    payload.url ??
    payload.link;
  if (typeof url === "string" && url.trim()) return url.trim();
  return null;
}

/** HK mobile → wa.me (offline / mock fallback). */
export function whatsappUrlFromPhone(phoneNumber) {
  let digits = String(phoneNumber ?? "").replace(/\D/g, "");
  if (digits.startsWith("852")) digits = digits.slice(3);
  if (digits.length > 8) digits = digits.slice(0, 8);
  if (digits.length !== 8) return null;
  return `https://wa.me/852${digits}`;
}

/**
 * WhatsApp deeplink from workspace API.
 * @param {{ orderId: string; phoneNumber?: string }} params
 */
export async function fetchGuestWhatsAppUrl({ orderId, phoneNumber }) {
  if (!orderId) return whatsappUrlFromPhone(phoneNumber);

  try {
    const res = await api.post(
      "supplier_order_guest_whatsapp",
      { order_id: orderId },
      { params: { locale: loadLocale() } },
    );
    const body = res.data;
    if (body?.status === true) {
      const fromApi = pickUrl(body.data) ?? pickUrl(body);
      if (fromApi) return fromApi;
    }
  } catch {
    // mock build or network — fall back to phone
  }

  return whatsappUrlFromPhone(phoneNumber);
}

/** @param {{ orderId: string; phoneNumber?: string }} params */
export async function openGuestWhatsApp(params) {
  const url = await fetchGuestWhatsAppUrl(params);
  if (!url) return false;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
