import { PET_VISIT_SERVICES_FALLBACK, REPAIR_SERVICE_GROUPS_FALLBACK } from "@/service/catalog/thirdPartyGlobal";
import { phone as formatPhoneDisplay } from "@/lib/format";
import { serviceApplicationFromProfile } from "@/service/apply/applyStatus";

/* ── Skills API → form catalog ── */

function skillById(services, skillId) {
  if (!Array.isArray(services)) return null;
  return services.find((row) => Number(row?.id) === skillId) ?? null;
}

function normalizeSkillItem(raw) {
  if (typeof raw === "string") {
    return { content: raw.trim(), isNeedCert: false };
  }
  if (!raw || typeof raw !== "object") return null;
  const content = String(raw.content ?? raw.name ?? "").trim();
  if (!content) return null;
  return {
    content,
    isNeedCert: raw.is_need_cert === true,
  };
}

function normalizeSkillGroup(group) {
  if (!group || typeof group !== "object") return null;
  const title = String(group.title ?? "").trim();
  const items = Array.isArray(group.items)
    ? group.items.map(normalizeSkillItem).filter(Boolean)
    : [];
  if (!title || items.length === 0) return null;
  return { title, items };
}

function normalizeSkillGroups(groups) {
  if (!Array.isArray(groups)) return [];
  return groups.map(normalizeSkillGroup).filter(Boolean);
}

function findGroup(groups, hint) {
  const needle = String(hint ?? "").trim();
  if (!needle) return null;
  return (
    groups.find((group) => group.title.includes(needle)) ??
    groups.find((group) => needle.includes(group.title)) ??
    null
  );
}

/** Service id 1 — grouped pills for repair apply form. */
export function repairServiceGroupsFromSkills(services) {
  const repair = skillById(services, 1);
  const groups = normalizeSkillGroups(repair?.groups);
  if (groups.length === 0) {
    return REPAIR_SERVICE_GROUPS_FALLBACK.map((group) => ({
      title: group.title,
      items: group.items.map((content) => ({ content, isNeedCert: false })),
    }));
  }
  return groups;
}

const PET_SIZE_FALLBACK = ["小型/貓", "中型狗", "大型狗"];
const PET_BOARDING_CAP_FALLBACK = ["一隻", "兩隻", "三隻+"];

/** Service id 2 — sections for pet apply form. */
export function petApplyCatalogFromSkills(services) {
  const pet = skillById(services, 2);
  const groups = normalizeSkillGroups(pet?.groups);

  const visitGroup =
    findGroup(groups, "上客人") ??
    (groups[0]
      ? { title: groups[0].title, items: groups[0].items }
      : {
          title: "你上客人屋企",
          items: PET_VISIT_SERVICES_FALLBACK.map((content) => ({
            content,
            isNeedCert: false,
          })),
        });

  const boardingGroup =
    findGroup(groups, "去你屋") ??
    ({
      title: "寵物去你屋",
      items: [{ content: "寄宿服務", isNeedCert: true }],
    });

  const sizeGroup =
    findGroup(groups, "體型") ??
    ({
      title: "可接受寵物體型",
      items: PET_SIZE_FALLBACK.map((content) => ({ content, isNeedCert: false })),
    });

  const capGroup =
    findGroup(groups, "最多接") ??
    ({
      title: "寄宿同時最多接幾多",
      items: PET_BOARDING_CAP_FALLBACK.map((content) => ({
        content,
        isNeedCert: false,
      })),
    });

  const visitContents = visitGroup.items.map((item) => item.content);
  const boardingItem =
    boardingGroup.items.find((item) => item.content.includes("寄宿")) ??
    boardingGroup.items[0] ??
    { content: "寄宿服務", isNeedCert: true };

  return {
    visitGroup,
    boardingGroup: { ...boardingGroup, primary: boardingItem },
    sizeGroup,
    capGroup,
    visitServices: visitContents,
    boardingService: boardingItem.content,
    boardingNeedsCert: boardingItem.isNeedCert,
    petSizes: sizeGroup.items.map((item) => item.content),
    boardingCaps: capGroup.items.map((item) => item.content),
  };
}

/* ── Basic fields from the profile session ── */

function regionLabel(item) {
  if (typeof item === "string") return item.trim();
  if (!item || typeof item !== "object") return "";
  return String(item.name ?? item.label ?? item.title ?? "").trim();
}

function formatDateBirthForForm(raw) {
  if (raw == null || raw === "") return "";
  const s = String(raw).trim();
  const match = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!match) return s;
  const month = match[2].padStart(2, "0");
  const day = match[3].padStart(2, "0");
  return `${match[1]}/${month}/${day}`;
}

function globalRegionRows(global) {
  const raw = global?.regions ?? global?.region;
  return Array.isArray(raw) ? raw : [];
}

/** Profile `service_area` → region codes for apply form (`HK`, `KLN`, …). */
function regionsFromProfile(profile, global) {
  const areas = profile?.serviceAreas;
  if (!Array.isArray(areas) || areas.length === 0) return [];

  const rows = globalRegionRows(global);
  const mapped = [];

  for (const entry of areas) {
    const raw =
      entry != null && typeof entry === "object"
        ? String(entry.code ?? entry.name ?? "").trim()
        : String(entry ?? "").trim();
    if (!raw) continue;

    const byCode = rows.find((row) => String(row?.code ?? "") === raw);
    if (byCode?.code) {
      mapped.push(String(byCode.code));
      continue;
    }
    const byName = rows.find(
      (row) => regionLabel(row) === raw || String(row?.name ?? "") === raw,
    );
    if (byName?.code) {
      mapped.push(String(byName.code));
      continue;
    }
    mapped.push(raw);
  }

  return [...new Set(mapped)];
}

/** Name / phone / dob / company / regions / avatars from session profile (API user). */
export function applyBasicFieldsFromSession(session, global) {
  const profile = session?.profile;
  const digits = String(session?.phone ?? profile?.phone ?? "").replace(/\D/g, "");
  const localPhone = digits.length > 8 ? digits.slice(-8) : digits;

  return {
    name: profile?.name ?? "",
    phone: localPhone.length === 8 ? formatPhoneDisplay(localPhone) : "",
    dob: formatDateBirthForForm(profile?.dateBirth ?? ""),
    company: profile?.companyName ?? "",
    region: regionsFromProfile(profile, global),
    profilePreview: profile?.profileImage ?? "",
    profileFile: null,
    idFrontPreview: profile?.identityCardFront ?? "",
    idFrontFile: null,
    idBackPreview: profile?.identityCardBack ?? "",
    idBackFile: null,
  };
}

/* ── Prefill from an existing application ── */

function skillsForService(profile, serviceId) {
  const row = profile?.services?.find(
    (entry) => Number(entry?.service) === Number(serviceId),
  );
  return Array.isArray(row?.skills) ? row.skills : [];
}

function skillsWithTitleHint(skills, hint) {
  return skills.filter((row) => String(row?.title ?? "").includes(hint));
}

const boardingPickupOptions = ["可以提供", "唔提供"];

export function petFormFromSession(session, catalog, global) {
  const basics = applyBasicFieldsFromSession(session, global);
  const skills = skillsForService(session?.profile, 2);
  const {
    visitGroup,
    boardingGroup,
    sizeGroup,
    capGroup,
    boardingService,
  } = catalog;

  const visitPool = new Set(visitGroup?.items?.map((i) => i.content) ?? []);
  const boardingPool = new Set(
    boardingGroup?.items?.map((i) => i.content) ?? [boardingService],
  );

  const selectedServices = skills
    .map((row) => row?.content)
    .filter(
      (content) => content && (visitPool.has(content) || boardingPool.has(content)),
    );

  const sizes = skillsWithTitleHint(skills, "體型")
    .map((row) => row.content)
    .filter(Boolean);
  const boardingCap =
    skillsWithTitleHint(skills, "最多接").find((row) => row?.content)?.content ??
    "";

  return {
    ...basics,
    services: [...new Set(selectedServices)],
    sizes: [...new Set(sizes)],
    boardingCap,
    boardingPickup: boardingPickupOptions[0],
    boardingLicensePreview: "",
    boardingLicenseFile: null,
    boardingLicenseNo: "",
    boardingLicenseExpiry: "",
    certificates: [],
    agree: false,
    error: "",
    dobError: "",
    dobCalendarOpen: false,
    nextCertId: 1,
  };
}

export function repairFormFromSession(session, serviceGroups, global) {
  const basics = applyBasicFieldsFromSession(session, global);
  const skills = skillsForService(session?.profile, 1);
  const allowed = new Set();
  for (const group of serviceGroups) {
    for (const raw of group.items ?? []) {
      const label =
        typeof raw === "string" ? raw : String(raw?.content ?? "").trim();
      if (label) allowed.add(label);
    }
  }
  const services = skills
    .map((row) => row?.content)
    .filter((content) => content && allowed.has(content));

  return {
    ...basics,
    services: [...new Set(services)],
    licenses: [
      { id: 1, name: "", years: "", photoPreview: "", photoFile: null },
    ],
    projectPhotos: [],
    agree: false,
    error: "",
    dobError: "",
    nextLicenseId: 3,
    dobCalendarOpen: false,
  };
}

export function shouldPrefillExistingApplication(session, serviceId) {
  const application = serviceApplicationFromProfile(session?.profile, serviceId);
  return application?.status === 1 || application?.status === 2;
}

/** 新申請：只帶 profile 基本資料，技能不預選。 */
export function emptyPetFormFromSession(session, catalog, global) {
  const filled = petFormFromSession(session, catalog, global);
  return {
    ...filled,
    services: [],
    sizes: [],
    boardingCap: "",
  };
}

export function emptyRepairFormFromSession(session, serviceGroups, global) {
  const filled = repairFormFromSession(session, serviceGroups, global);
  return { ...filled, services: [] };
}
