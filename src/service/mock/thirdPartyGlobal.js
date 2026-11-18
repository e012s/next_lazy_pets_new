import { APPLY_REGION_OPTIONS_FALLBACK } from "@/service/catalog/thirdPartyGlobal";

/** Local / offline `third_party_global` — catalog helpers still apply fallbacks for skills. */
export function mockThirdPartyGlobalData() {
  return {
    regions: APPLY_REGION_OPTIONS_FALLBACK.map(({ code, name }) => ({
      code,
      name,
    })),
    holidays: [],
    districts: [],
    skills: [
      { id: 1, name: "維修安裝服務", groups: [] },
      { id: 2, name: "寵物服務", groups: [] },
    ],
    total: [
      { id: 1, name: "維修安裝服務", total: 2 },
      { id: 2, name: "寵物服務", total: 4 },
    ],
  };
}
