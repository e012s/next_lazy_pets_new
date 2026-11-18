/** Legacy string list (avoid for apply `service_area`; use `APPLY_REGION_OPTIONS_FALLBACK`). */
export const APPLY_REGIONS_FALLBACK = ["港島", "九龍", "新界東", "新界西", "離島"];

/** Same as workspace `third_party_global.regions`. */
export const APPLY_REGION_OPTIONS_FALLBACK = [
  { code: "HK", name: "香港區" },
  { code: "KLN", name: "九龍區" },
  { code: "NT", name: "新界區" },
  { code: "RR", name: "偏遠區" },
  { code: "SA", name: "指定地區" },
];

export const PET_VISIT_SERVICES_FALLBACK = [
  "寵物散步",
  "上門照顧",
  "上門過夜照顧",
  "寵物美容 (上門)",
];

export const REPAIR_SERVICE_GROUPS_FALLBACK = [
  { title: "水電 · 喉管", items: ["水電維修", "更換食水喉"] },
  { title: "冷氣 · 電器", items: ["冷氣更換", "電力工程", "冷氣喉管改裝"] },
  { title: "傢俱 · 裝修", items: ["傢俱安裝", "油漆翻新", "地板翻新"] },
  { title: "大型工程", items: ["天台防漏", "渠務工程", "外牆批盪"] },
];

function skillEntryFromGlobal(global, skillId) {
  const skills = global?.skills;
  if (!Array.isArray(skills)) return null;
  return skills.find((entry) => Number(entry?.id) === skillId) ?? null;
}

function labelFromUnknown(item) {
  if (typeof item === "string") return item.trim();
  if (!item || typeof item !== "object") return "";
  return String(item.name ?? item.label ?? item.title ?? item.text ?? "").trim();
}

function labelsFromList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(labelFromUnknown).filter(Boolean);
}

export function regionLabelsFromGlobal(global) {
  return applyRegionsFromGlobal(global).map((row) => row.name);
}

/** Apply form pills: `{ code, name }[]` from `global.regions`. */
export function applyRegionsFromGlobal(global) {
  const raw = global?.regions ?? global?.region;
  if (!Array.isArray(raw)) return [...APPLY_REGION_OPTIONS_FALLBACK];

  const options = raw
    .map((row) => {
      if (typeof row === "string") {
        const name = row.trim();
        return name ? { code: name, name } : null;
      }
      if (!row || typeof row !== "object") return null;
      const code = String(row.code ?? row.id ?? "").trim();
      const name = labelFromUnknown(row);
      if (!code || !name) return null;
      return { code, name };
    })
    .filter(Boolean);

  return options.length > 0 ? options : [...APPLY_REGION_OPTIONS_FALLBACK];
}

function normalizeServiceGroup(entry) {
  if (!entry || typeof entry !== "object") return null;
  const title = labelFromUnknown(entry.title ?? entry.category ?? entry.group ?? entry.name);
  const items = labelsFromList(
    entry.items ?? entry.services ?? entry.children ?? entry.skills ?? entry.list,
  );
  if (!title || items.length === 0) return null;
  return { title, items };
}

function groupsFromSkillsTree(skills) {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    const asGroups = skills.map(normalizeServiceGroup).filter(Boolean);
    if (asGroups.length > 0) return asGroups;
    const flat = labelsFromList(skills);
    return flat.length > 0 ? [{ title: "服務", items: flat }] : [];
  }
  if (typeof skills === "object") {
    return Object.entries(skills)
      .map(([key, value]) => {
        const items = labelsFromList(value);
        if (items.length === 0) return null;
        return { title: labelFromUnknown(key) || "服務", items };
      })
      .filter(Boolean);
  }
  return [];
}

export function petVisitServicesFromGlobal(global) {
  const petSkill = skillEntryFromGlobal(global, 2);
  const fromPetSkill = labelsFromList(petSkill?.groups);
  if (fromPetSkill.length > 0) return fromPetSkill;
  const fromPetGroups = groupsFromSkillsTree(petSkill?.groups);
  if (fromPetGroups.length === 1 && fromPetGroups[0].items.length > 0) {
    return fromPetGroups[0].items;
  }
  if (fromPetGroups.length > 0) {
    return fromPetGroups.flatMap((group) => group.items);
  }

  const raw =
    global?.pet_skills ??
    global?.pet_services ??
    (global?.skills && typeof global.skills === "object" ? global.skills.pet : null) ??
    (Array.isArray(global?.skills) ? global.skills : null);
  const labels = labelsFromList(raw);
  if (labels.length > 0) return labels;
  const grouped = groupsFromSkillsTree(raw);
  if (grouped.length === 1 && grouped[0].items.length > 0) return grouped[0].items;
  return PET_VISIT_SERVICES_FALLBACK;
}

export function repairServiceGroupsFromGlobal(global) {
  const repairSkill = skillEntryFromGlobal(global, 1);
  const fromRepairSkill = groupsFromSkillsTree(repairSkill?.groups);
  if (fromRepairSkill.length > 0) return fromRepairSkill;

  const raw =
    global?.repair_skills ??
    global?.repair_services ??
    (global?.skills && typeof global.skills === "object" ? global.skills.repair : null);
  const fromTree = groupsFromSkillsTree(raw);
  if (fromTree.length > 0) return fromTree;
  if (Array.isArray(global?.skills)) {
    const fromAll = groupsFromSkillsTree(global.skills);
    if (fromAll.length > 0) return fromAll;
  }
  return REPAIR_SERVICE_GROUPS_FALLBACK;
}
