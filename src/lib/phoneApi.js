/** Hong Kong workspace API expects `phone` like `85212345678` (no `+`). */
export const HK_WORKSPACE_DIAL = "852";

/** Digits only — local HK mobile (8 digits). */
export function localPhoneDigits(value) {
  let d = String(value ?? "").replace(/\D/g, "");
  if (d.startsWith(HK_WORKSPACE_DIAL) && d.length > HK_WORKSPACE_DIAL.length) {
    d = d.slice(HK_WORKSPACE_DIAL.length);
  }
  return d.slice(0, 8);
}

/** Body field for `third_party_login_*` and related workspace endpoints. */
export function phoneForWorkspaceApi(localDigits) {
  const local = localPhoneDigits(localDigits);
  if (local.length !== 8) return local;
  return `${HK_WORKSPACE_DIAL}${local}`;
}

/** Session / UI use 8-digit HK numbers after API returns prefixed `phone`. */
export function localPhoneFromApi(phone) {
  return localPhoneDigits(phone);
}
