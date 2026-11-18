const KEY = "expertRegisteredCategories";

/** @returns {("pet" |"repair")[]} */
export function loadRegisteredCategories() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => entry === "pet" || entry === "repair");
  } catch {
    return [];
  }
}

/** @param {"pet" |"repair"} category */
export function addRegisteredCategory(category) {
  if (typeof window === "undefined") return loadRegisteredCategories();
  const next = new Set(loadRegisteredCategories());
  if (category === "pet" || category === "repair") next.add(category);
  const list = [...next];
  window.localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}

export function clearRegisteredCategories() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
