import proxyApi from "@/lib/api/Axios";
import { isCapacitorApp } from "@/lib/api/capacitorApp";
import { normalizePathname } from "@/lib/pathname";
import { loadLocale } from "@/lib/preferences";

export const PROFILE_ENDPOINT = "retrieve_third_party_user_profile";
export const HOME = "/";

export const PUBLIC_AUTH_PATHS = new Set(["/login", "/verification"]);

export function isPublicAuthPath(pathname) {
  return PUBLIC_AUTH_PATHS.has(normalizePathname(pathname));
}

const SKILL_TO_ROLE = { 1: "repair", 2: "pet" };

const ACCOUNT_STATUS = { ACTIVE: 1, DISABLED: 2, BLOCKED: 3 };
const SERVICE_STATUS = { ACTIVE: 2 };

function roleFromSkillIds(skill) {
  if (!Array.isArray(skill) || skill.length === 0) return null;
  for (const entry of skill) {
    const id = Number(entry);
    if (SKILL_TO_ROLE[id]) return SKILL_TO_ROLE[id];
  }
  return null;
}

function pickUser(data) {
  if (!data || typeof data !== "object") return null;
  if (data.user && typeof data.user === "object") return data.user;
  return data;
}

function registeredFromLegacyFlags(data) {
  const record = pickUser(data);
  if (!record) return null;
  if ("is_new_user" in record) {
    const v = record.is_new_user;
    if (v === 0 || v === "0") return true;
    if (v === 1 || v === "1") return false;
  }
  for (const key of ["registered", "is_registered"]) {
    if (!(key in record)) continue;
    const v = record[key];
    if (v === true || v === 1 || v === "1") return true;
    if (v === false || v === 0 || v === "0") return false;
  }
  return null;
}

function registeredFromProfileData(data) {
  const user = pickUser(data);
  if (user?.need_basic_info === true) return false;
  if (Array.isArray(user?.services)) {
    const active = user.services.some(
      (row) => Number(row?.status) === SERVICE_STATUS.ACTIVE,
    );
    if (active) return true;
  }
  const legacy = registeredFromLegacyFlags(data);
  if (legacy === true) return true;
  if (legacy === false) return false;
  return user?.need_basic_info === false;
}

function simplifyProfileUser(user) {
  if (!user || typeof user !== "object") return null;
  const phone = String(user.phone ?? "").replace(/\D/g, "");
  const localPhone = phone.length > 8 ? phone.slice(-8) : phone;
  return {
    name: String(user.name ?? "").trim(),
    nameEn: String(user.name_en ?? "").trim(),
    phone: localPhone,
    email: String(user.email ?? "").trim(),
    profileImage: String(user.profile_image ?? "").trim(),
    gender: user.gender != null ? Number(user.gender) : null,
    accountStatus: user.status != null ? Number(user.status) : null,
    skills: Array.isArray(user.skill) ? user.skill.map((id) => Number(id)) : [],
    needBasicInfo: user.need_basic_info === true,
    dateBirth: user.date_birth != null ? String(user.date_birth).trim() : "",
    companyName:
      user.company_name != null ? String(user.company_name).trim() : "",
    identityCardFront: String(user.identity_card?.front ?? "").trim(),
    identityCardBack: String(user.identity_card?.back ?? "").trim(),
    serviceAreas: Array.isArray(user.service_area) ? user.service_area : [],
    services: Array.isArray(user.services)
      ? user.services.map((row) => ({
          service: row?.service,
          serviceName: row?.service_name ?? "",
          status: row?.status != null ? Number(row.status) : null,
          statusName: row?.status_name ?? "",
          skills: Array.isArray(row?.skills)
            ? row.skills.map((skill) => ({
                title: String(skill?.title ?? "").trim(),
                content: String(skill?.content ?? "").trim(),
              }))
            : [],
        }))
      : [],
    certificates: Array.isArray(user.certificates) ? user.certificates : [],
    extraInfo: Array.isArray(user.extra_info) ? user.extra_info : [],
  };
}

function parseProfileResponse(res) {
  if (!res?.status || !res.data || typeof res.data !== "object") {
    return { ok: false, message: res?.message };
  }
  const data = res.data;
  const user = pickUser(data);
  const simplified = simplifyProfileUser(user);
  if (!simplified?.phone) {
    return { ok: false, message: res?.message ?? "未登入" };
  }
  return { ok: true, data, user, simplified, message: res.message };
}

export function sessionFromProfileResponse(res) {
  const parsed = parseProfileResponse(res);
  if (!parsed.ok) return { authenticated: false };

  const { data, simplified } = parsed;
  const user = data.user && typeof data.user === "object" ? data.user : data;
  const role =
    (typeof data.role === "string" && data.role) ||
    (typeof user.role === "string" && user.role) ||
    roleFromSkillIds(simplified.skills) ||
    "pet";

  const active =
    simplified.accountStatus == null ||
    simplified.accountStatus === ACCOUNT_STATUS.ACTIVE;
  if (!active) return { authenticated: false };

  return {
    authenticated: true,
    phone: simplified.phone,
    role,
    registered: registeredFromProfileData(data),
    next: HOME,
    needBasicInfo: simplified.needBasicInfo,
    profile: simplified,
  };
}

export async function retrieveThirdPartyUserProfile() {
  try {
    const res = await proxyApi.post(PROFILE_ENDPOINT, {});
    return res.data;
  } catch (err) {
    return err?.response?.data ?? { status: false, transient: true };
  }
}

export async function readClientSession() {
  const res = await retrieveThirdPartyUserProfile();
  const session = sessionFromProfileResponse(res);
  return res?.transient ? { ...session, transient: true } : session;
}

export async function markClientRegistered() {
  if (isCapacitorApp()) {
    return readClientSession();
  }
  try {
    const locale = encodeURIComponent(loadLocale());
    const res = await fetch(`/api/auth/register?locale=${locale}`, {
      method: "POST",
      credentials: "same-origin",
    });
    if (!res.ok) return { authenticated: false };
    return await res.json();
  } catch {
    return { authenticated: false };
  }
}
