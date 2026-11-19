import proxyApi from "@/lib/api/Axios";
import appConfig from "../../../appconfig.json";
import { isCapacitorApp } from "@/lib/api/capacitorApp";
import { validateDob } from "@/lib/format";
import { loadLocale, loadToken } from "@/lib/preferences";

/* ── Skills catalogue API (`retrieve_third_party_skills`) ── */

const SKILLS_ENDPOINT = "retrieve_third_party_skills";

/** POST /api/retrieve_third_party_skills — no token; optional `service` 1 repair / 2 pet. */
export async function fetchThirdPartySkills({ service } = {}) {
  const body = {};
  if (service != null) body.service = Number(service);

  try {
    const res = await proxyApi.post(SKILLS_ENDPOINT, body);
    return res.data;
  } catch (err) {
    return err?.response?.data ?? { status: false, message: "載入服務類別失敗" };
  }
}

/* ── Skill JSON sent with the application ── */

function itemLabel(item) {
  return typeof item === "string" ? item : String(item?.content ?? "").trim();
}

/** 新格式 `skill`：`[{"service":1,"content":[{"title","content"},…]}]` */
export function buildRepairSkillJson(serviceGroups, selectedServices) {
  const picked = new Set(selectedServices);
  const content = [];
  for (const group of serviceGroups) {
    const title = String(group?.title ?? "").trim();
    if (!title) continue;
    for (const raw of group.items ?? []) {
      const label = itemLabel(raw);
      if (!label || !picked.has(label)) continue;
      content.push({ title, content: label });
    }
  }
  return JSON.stringify([{ service: 1, content }]);
}

export function buildPetSkillJson(catalog, form) {
  const content = [];
  const {
    visitGroup,
    boardingGroup,
    sizeGroup,
    capGroup,
    boardingService,
  } = catalog;
  const selected = new Set(form.services ?? []);

  for (const label of selected) {
    if (visitGroup?.items?.some((row) => row.content === label)) {
      content.push({ title: visitGroup.title, content: label });
    } else if (label === boardingService) {
      content.push({ title: boardingGroup.title, content: label });
    }
  }
  for (const label of form.sizes ?? []) {
    content.push({ title: sizeGroup.title, content: label });
  }
  if (selected.has(boardingService) && form.boardingCap) {
    content.push({ title: capGroup.title, content: form.boardingCap });
  }
  return JSON.stringify([{ service: 2, content }]);
}

export function repairSelectionNeedsCertificate(serviceGroups, selectedServices) {
  const picked = new Set(selectedServices);
  for (const group of serviceGroups) {
    for (const raw of group.items ?? []) {
      const label = itemLabel(raw);
      if (!label || !picked.has(label)) continue;
      if (raw?.isNeedCert) return true;
    }
  }
  return false;
}

/* ── Form validation + FormData helpers ── */

/**
 * 申請專家：必填欄位、錯誤文案、表單校驗、multipart 輔助
 * （維護請只改此檔；提交組包見下方 Submit 區）
 */
// ─── 錯誤文案（與下方校驗一一對應）────────────────────────────
export const APPLY_ERRORS = {
  name: "請填寫姓名。",
  phone: "請輸入 8 位電話號碼。",
  profileImage: "請上載個人相片。",
  idCards: "請上載香港身份證正面同背面。",
  idCardsResubmit: "請重新上載香港身份證正面同背面。",
  agree: "請先同意服務條款及私隱政策。",
  petRegion: "請揀主要服務地區。",
  petServices: "請揀至少一項寵物服務。",
  petSizes: "請揀可接受體型。",
  repairRegion: "請揀主要服務地區。",
  repairServices: "請揀至少一項服務。",
  boardingCap: "請揀寄宿同時最多接幾多隻。",
  boardingLicense: "提供寄宿服務須上載動物寄養所牌照。",
  boardingLicenseNo: "提供寄宿服務須填寫牌照號碼。",
  boardingLicenseExpiry: "請輸入有效的牌照到期日（YYYY/MM/DD）。",
  repairCert: "所選服務須上載相關證書或牌照。",
  boardingCertUpload: "寄宿服務須上載動物寄養所牌照。",
};

/**
 * 必填速查（實際邏輯在 validate* / submit*Application）
 * - form：前端 form 欄位
 * - key：apply_third_parties multipart 欄位名
 */
export const APPLY_REQUIRED = {
  /** 每次提交（寵物／維修） */
  always: ["name", "phone", "agree"],
  /** shouldSendApplyBasicFields(session) 時才驗證並送 multipart */
  basic: [
    { form: "dob", key: "date_birth" },
    { form: "region", key: "service_area[]" },
    {
      form: ["idFrontPreview", "idBackPreview"],
      key: ["identity_card_front", "identity_card_back"],
    },
    { form: ["profilePreview", "profileFile"], key: "profile_image" },
    { form: "name", key: "name" },
    { form: "company", key: "company_name", optional: true },
  ],
  /** 頭像必填條件（見 isProfileImageRequired） */
  profileImageWhen: ["shouldSendApplyBasicFields", "isProfileImageRequired"],
  pet: ["region", "services", "sizes"],
  petBoarding: [
    { form: "boardingCap", when: "boardingSelected", note: "skill capGroup.title" },
    {
      form: ["boardingLicensePreview", "boardingLicenseFile"],
      key: "certificate",
      when: "boardingNeedsCert",
    },
    { form: "boardingLicenseNo", key: "license_name", when: "boardingNeedsCert" },
    { form: "boardingLicenseExpiry", when: "boardingNeedsCert" },
  ],
  repair: ["region", "services"],
  repairCert: {
    when: "repairSelectionNeedsCertificate",
    form: "licenses (photoPreview / photoFile)",
    key: "certificate",
  },
  /** 每次 POST 必帶的 multipart 欄位 */
  submitKeys: ["skill"],
};

// ─── Session / 上傳輔助 ───────────────────────────────────────
export function shouldSendApplyBasicFields(session) {
  if (session?.needBasicInfo === true) return true;
  const services = session?.profile?.services;
  return !Array.isArray(services) || services.length === 0;
}

function isProfileImageRequired(session) {
  if (shouldSendApplyBasicFields(session)) return true;
  const url = String(session?.profile?.profileImage ?? "").trim();
  return !url;
}

function hasProfileImageCandidate(form) {
  if (form?.profileFile instanceof File) return true;
  return Boolean(String(form?.profilePreview ?? "").trim());
}

export async function fileFromPreview(preview, filename, storedFile) {
  if (storedFile instanceof File) return storedFile;
  if (!preview) return null;
  try {
    const res = await fetch(preview);
    const blob = await res.blob();
    const type = blob.type || "image/jpeg";
    return new File([blob], filename, { type });
  } catch {
    return null;
  }
}

export function dobToApiDate(dob) {
  const s = String(dob ?? "").trim();
  const m = s.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (!m) return s;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

export async function appendProfileImageField(formData, form, { required = false } = {}) {
  const profile = await fileFromPreview(
    form.profilePreview,
    "profile.jpg",
    form.profileFile,
  );
  if (profile) {
    formData.append("profile_image", profile);
    return true;
  }
  if (required) throw new Error(APPLY_ERRORS.profileImage);
  return false;
}

// ─── 校驗 ───────────────────────────────────────────────────
function fail(message, extra = {}) {
  return { ok: false, message, ...extra };
}

function pass() {
  return { ok: true };
}

function chain(checks) {
  for (const run of checks) {
    const result = run();
    if (!result.ok) return result;
  }
  return pass();
}

export function firstLicenseWithUpload(licenses) {
  if (!Array.isArray(licenses)) return null;
  return (
    licenses.find((row) => row?.photoFile instanceof File) ??
    licenses.find((row) => row?.photoPreview) ??
    null
  );
}

function validateApplyBasicSection(session, form) {
  const sendBasic = shouldSendApplyBasicFields(session);
  return chain([
    () =>
      isProfileImageRequired(session) && !hasProfileImageCandidate(form)
        ? fail(APPLY_ERRORS.profileImage)
        : pass(),
    () =>
      !String(form?.name ?? "").trim() ? fail(APPLY_ERRORS.name) : pass(),
    () => {
      const digits = String(form?.phone ?? "").replace(/\s/g, "");
      return /^\d{8}$/.test(digits) ? pass() : fail(APPLY_ERRORS.phone);
    },
    () => {
      if (!sendBasic) return pass();
      const dobCheck = validateDob(form.dob);
      return dobCheck.ok
        ? pass()
        : fail(dobCheck.message, { dobError: dobCheck.message });
    },
  ]);
}

/** 身份證區（在服務範圍之後） */
function validateApplyIdSection(session, form) {
  if (!shouldSendApplyBasicFields(session)) return pass();
  if (form.idFrontPreview && form.idBackPreview) return pass();
  return fail(APPLY_ERRORS.idCards);
}

function validateAgree(form) {
  return form.agree ? pass() : fail(APPLY_ERRORS.agree);
}

/** 順序：基本資料 → 地區 → 服務 → 體型 → 寄宿 → 身份證 → 寄宿牌照 → 條款 */
export function validatePetApplyForm(session, form, catalog) {
  const boardingSelected = form.services?.includes(catalog.boardingService);

  return chain([
    () => validateApplyBasicSection(session, form),
    () =>
      form.region.length === 0 ? fail(APPLY_ERRORS.petRegion) : pass(),
    () =>
      form.services.length === 0 ? fail(APPLY_ERRORS.petServices) : pass(),
    () => (form.sizes.length === 0 ? fail(APPLY_ERRORS.petSizes) : pass()),
    () =>
      boardingSelected && !form.boardingCap
        ? fail(APPLY_ERRORS.boardingCap)
        : pass(),
    () => validateApplyIdSection(session, form),
    () => {
      if (!boardingSelected || !catalog.boardingNeedsCert) return pass();
      if (!form.boardingLicensePreview && !form.boardingLicenseFile) {
        return fail(APPLY_ERRORS.boardingLicense);
      }
      if (!String(form.boardingLicenseNo ?? "").trim()) {
        return fail(APPLY_ERRORS.boardingLicenseNo);
      }
      const expiryCheck = validateDob(form.boardingLicenseExpiry);
      if (!expiryCheck.ok) {
        return fail(APPLY_ERRORS.boardingLicenseExpiry);
      }
      return pass();
    },
    () => validateAgree(form),
  ]);
}

export function validateRepairApplyForm(session, form, serviceGroups) {
  return chain([
    () => validateApplyBasicSection(session, form),
    () =>
      form.region.length === 0 ? fail(APPLY_ERRORS.repairRegion) : pass(),
    () =>
      form.services.length === 0 ? fail(APPLY_ERRORS.repairServices) : pass(),
    () => validateApplyIdSection(session, form),
    () => {
      if (!repairSelectionNeedsCertificate(serviceGroups, form.services)) {
        return pass();
      }
      const license = firstLicenseWithUpload(form.licenses);
      if (license?.photoPreview || license?.photoFile) return pass();
      return fail(APPLY_ERRORS.repairCert);
    },
    () => validateAgree(form),
  ]);
}

export function assertPetApplyForm(session, form, catalog) {
  const result = validatePetApplyForm(session, form, catalog);
  if (!result.ok) throw new Error(result.message);
}

export function assertRepairApplyForm(session, form, serviceGroups) {
  const result = validateRepairApplyForm(session, form, serviceGroups);
  if (!result.ok) throw new Error(result.message);
}

/* ── Submit (`apply_third_parties`) ── */

const APPLY_BFF = "/api/apply_third_parties";
const APPLY_WORKSPACE = `${appConfig.apiBaseUrl.replace(/\/$/, "")}/apply_third_parties`;

function appendServiceAreas(formData, regionCodes) {
  for (const code of regionCodes ?? []) {
    const value = String(code ?? "").trim();
    if (value) formData.append("service_area[]", value);
  }
}

/** Repair apply → workspace `apply_third_parties`. */
export async function submitRepairApplication({
  session,
  form,
  serviceGroups,
}) {
  try {
    assertRepairApplyForm(session, form, serviceGroups);
  } catch (err) {
    const message = err instanceof Error ? err.message : "申請提交失敗";
    return { status: false, message };
  }

  const skill = buildRepairSkillJson(serviceGroups, form.services);
  return submitApplyFormData(async (formData) => {
    formData.append("skill", skill);

    const sendBasic = shouldSendApplyBasicFields(session);
    if (sendBasic) {
      formData.append("name", form.name.trim());
      if (form.company?.trim()) {
        formData.append("company_name", form.company.trim());
      }
      const dob = dobToApiDate(form.dob);
      if (dob) formData.append("date_birth", dob);
      appendServiceAreas(formData, form.region);

      const idFront = await fileFromPreview(
        form.idFrontPreview,
        "identity_card_front.jpg",
        form.idFrontFile,
      );
      const idBack = await fileFromPreview(
        form.idBackPreview,
        "identity_card_back.jpg",
        form.idBackFile,
      );
      if (!idFront || !idBack) {
        throw new Error(APPLY_ERRORS.idCardsResubmit);
      }
      formData.append("identity_card_front", idFront);
      formData.append("identity_card_back", idBack);

      await appendProfileImageField(formData, form, { required: true });
    } else if (form.profileFile instanceof File) {
      await appendProfileImageField(formData, form, { required: true });
    }

    const needsCert = repairSelectionNeedsCertificate(
      serviceGroups,
      form.services,
    );
    const license = firstLicenseWithUpload(form.licenses);
    if (needsCert || license) {
      const cert = await fileFromPreview(
        license?.photoPreview,
        "certificate.jpg",
        license?.photoFile,
      );
      if (needsCert && !cert) {
        throw new Error(APPLY_ERRORS.repairCert);
      }
      if (cert) {
        formData.append("certificate", cert);
        if (license?.name?.trim()) {
          formData.append("license_name", license.name.trim());
        }
        if (license?.years?.trim()) {
          formData.append("years_of_experience", license.years.trim());
        }
      }
    }
  });
}

/** Pet apply → workspace `apply_third_parties`. */
export async function submitPetApplication({ session, form, catalog }) {
  try {
    assertPetApplyForm(session, form, catalog);
  } catch (err) {
    const message = err instanceof Error ? err.message : "申請提交失敗";
    return { status: false, message };
  }

  const skill = buildPetSkillJson(catalog, form);
  return submitApplyFormData(async (formData) => {
    formData.append("skill", skill);

    const sendBasic = shouldSendApplyBasicFields(session);
    if (sendBasic) {
      formData.append("name", form.name.trim());
      if (form.company?.trim()) {
        formData.append("company_name", form.company.trim());
      }
      const dob = dobToApiDate(form.dob);
      if (dob) formData.append("date_birth", dob);
      appendServiceAreas(formData, form.region);

      const idFront = await fileFromPreview(
        form.idFrontPreview,
        "identity_card_front.jpg",
        form.idFrontFile,
      );
      const idBack = await fileFromPreview(
        form.idBackPreview,
        "identity_card_back.jpg",
        form.idBackFile,
      );
      if (!idFront || !idBack) {
        throw new Error(APPLY_ERRORS.idCardsResubmit);
      }
      formData.append("identity_card_front", idFront);
      formData.append("identity_card_back", idBack);

      await appendProfileImageField(formData, form, { required: true });
    } else if (form.profileFile instanceof File) {
      await appendProfileImageField(formData, form, { required: true });
    }

    const boardingSelected = form.services?.includes(catalog.boardingService);
    if (boardingSelected && catalog.boardingNeedsCert) {
      const cert = await fileFromPreview(
        form.boardingLicensePreview,
        "boarding_license.jpg",
        form.boardingLicenseFile,
      );
      if (!cert) {
        throw new Error(APPLY_ERRORS.boardingCertUpload);
      }
      formData.append("certificate", cert);
      if (form.boardingLicenseNo?.trim()) {
        formData.append("license_name", form.boardingLicenseNo.trim());
      }
    }

    const extraCert = form.certificates?.find(
      (row) => row?.photoFile || row?.photoPreview,
    );
    if (extraCert && !formData.has("certificate")) {
      const cert = await fileFromPreview(
        extraCert.photoPreview,
        "certificate.jpg",
        extraCert.photoFile,
      );
      if (cert) {
        formData.append("certificate", cert);
        if (extraCert.name?.trim()) {
          formData.append("license_name", extraCert.name.trim());
        }
      }
    }
  });
}

async function submitApplyFormData(appendFields) {
  const formData = new FormData();
  try {
    await appendFields(formData);
  } catch (err) {
    const message = err instanceof Error ? err.message : "申請提交失敗";
    return { status: false, message };
  }

  const locale = encodeURIComponent(loadLocale());
  const native = isCapacitorApp();
  const url = `${(native ? APPLY_WORKSPACE : APPLY_BFF)}?locale=${locale}`;
  try {
    const token = native ? await loadToken() : null;
    if (native && !token) {
      return { status: false, message: "未登入" };
    }
    const res = await fetch(url, {
      method: "POST",
      credentials: native ? "omit" : "same-origin",
      headers: native ? { token } : undefined,
      body: formData,
    });
    const json = await res.json();
    if (!res.ok && json?.status !== true) {
      return {
        status: false,
        message: json?.message ?? "申請提交失敗",
      };
    }
    return json;
  } catch (err) {
    const message = err instanceof Error ? err.message : "申請提交失敗";
    return { status: false, message };
  }
}
