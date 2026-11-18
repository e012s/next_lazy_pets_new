import { primeSessionCache } from "@/context/SessionContext";
import { sessionFromProfileResponse } from "@/service/auth/profile";

/* ── Role chooser + application status per service ── */

const ROLE_ROUTE = {
  1: {
    id: "repair",
    href: "/apply/repair",
    next: "下一步：選擇維修子服務",
    detailFallback: "15種子服務",
    iconKey: "apply-repair",
  },
  2: {
    id: "pet",
    href: "/apply/pet",
    next: "下一步：選擇寵物子服務",
    detailFallback: "8種子服務",
    iconKey: "apply-pet",
  },
};

function label(value) {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    return String(value.name ?? value.title ?? "").trim();
  }
  return "";
}

function totalsBySkillId(global) {
  const map = new Map();
  const list = global?.total;
  if (!Array.isArray(list)) return map;
  for (const entry of list) {
    const skillId = Number(entry?.id);
    if (!skillId) continue;
    const count = Number(entry?.total);
    if (Number.isFinite(count) && count > 0) {
      map.set(skillId, count);
    }
  }
  return map;
}

function mapSkillToChoice(skill, subCount) {
  const skillId = Number(skill?.id);
  const route = ROLE_ROUTE[skillId];
  if (!route) return null;

  const title =
    label(skill.name) || (skillId === 1 ? "維修安裝服務" : "寵物服務");
  const count = Number(subCount);
  const detail =
    Number.isFinite(count) && count > 0
      ? `${count}種子服務`
      : route.detailFallback;

  return {
    skillId,
    id: route.id,
    title,
    detail,
    href: route.href,
    next: route.next,
    icon: route.iconKey,
  };
}

/** `retrieve_third_party_skills` + `third_party_global.total` */
export function applyRoleChoicesFromSkills(services, global) {
  if (!Array.isArray(services) || services.length === 0) return [];
  const totals = totalsBySkillId(global);
  return services
    .map((skill) => {
      const skillId = Number(skill?.id);
      const subCount = totals.get(skillId);
      return mapSkillToChoice(skill, subCount);
    })
    .filter(Boolean)
    .sort((a, b) => a.skillId - b.skillId);
}

/** 已有申請紀錄的 service id（1 申請中／2 啟用／3 停用仍顯示，可查看或再申請視情況）。 */
export function serviceApplicationFromProfile(profile, serviceId) {
  const rows = profile?.services;
  if (!Array.isArray(rows)) return null;
  const row = rows.find(
    (entry) => Number(entry?.service) === Number(serviceId),
  );
  if (!row) return null;
  const status =
    row?.status != null && Number.isFinite(Number(row.status))
      ? Number(row.status)
      : 1;
  return {
    status,
    statusName: String(row?.statusName ?? row?.status_name ?? "").trim(),
    serviceName: String(row?.serviceName ?? row?.service_name ?? "").trim(),
  };
}

export function applyRoleChoicesWithApplication(choices, profile) {
  if (!Array.isArray(choices)) return [];
  return choices.map((choice) => {
    const application = serviceApplicationFromProfile(profile, choice.skillId);
    const submittedHref = `/apply/submitted?service=${choice.skillId}`;
    return {
      ...choice,
      application,
      href:
        application?.status === 1 || application?.status === 2
          ? submittedHref
          : choice.href,
      actionLabel:
        application?.status === 1
          ? "查看申請進度"
          : application?.status === 2
            ? "查看已啟用服務"
            : choice.next,
    };
  });
}

/* ── Submitted summary + step bars ── */

function serviceRowFromList(rows, serviceId) {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const match = rows.find((row) => Number(row?.service) === Number(serviceId));
  return match ?? rows[rows.length - 1];
}

function serviceRowForApply(user, serviceId) {
  return serviceRowFromList(user?.services, serviceId);
}

function skillsByTitleHint(skills, hint) {
  if (!Array.isArray(skills)) return [];
  const needle = String(hint);
  return skills.filter((row) => String(row?.title ?? "").includes(needle));
}

function areaLabels(user) {
  const areas = user?.service_area;
  if (!Array.isArray(areas)) return [];
  return areas
    .map((row) => {
      if (typeof row === "string") return row.trim();
      if (!row || typeof row !== "object") return "";
      return String(row.name ?? row.code ?? "").trim();
    })
    .filter(Boolean);
}

function serviceName(row) {
  return row?.service_name ?? row?.serviceName ?? "";
}

function statusName(row) {
  if (!row) return "";
  const name = String(row?.status_name ?? row?.statusName ?? "").trim();
  return name || "申請中";
}

/** Map API / session user shape to submitted page summary. */
function buildSubmittedSummaryFromUser(user, serviceId) {
  const kind = Number(serviceId) === 1 ? "repair" : "pet";
  const svc = serviceRowForApply(user, serviceId);
  const skills = Array.isArray(svc?.skills) ? svc.skills : [];
  const areas = areaLabels(user);
  const idCard = user?.identity_card;

  if (kind === "repair") {
    const selectable = skills.filter((row) => row?.content);
    return {
      kind,
      category: serviceName(svc) || "維修安裝服務",
      statusName: statusName(svc),
      serviceCount: selectable.length,
      serviceLabels: selectable.map((row) => row.content).join("、"),
      regionCount: areas.length,
      regionLabels: areas.join("、"),
      applicantName: String(user?.name ?? "").trim(),
      idUploaded: Boolean(idCard?.front && idCard?.back),
      licenseFilled: Array.isArray(user?.certificates)
        ? user.certificates.length
        : 0,
      licenseMax: 3,
      photoCount: Array.isArray(user?.extra_info) ? user.extra_info.length : 0,
    };
  }

  const visitSkills = skillsByTitleHint(skills, "上客人");
  const boardingSkills = skillsByTitleHint(skills, "去你屋");
  const sizeSkills = skillsByTitleHint(skills, "體型");
  const capSkills = skillsByTitleHint(skills, "最多接");
  const visitCount = visitSkills.length + boardingSkills.length;
  const boardingCap = capSkills[0]?.content ?? null;
  const boardingSelected = boardingSkills.length > 0;

  return {
    kind,
    category: serviceName(svc) || "寵物服務",
    statusName: statusName(svc),
    serviceCount: visitCount,
    serviceLabels: [...visitSkills, ...boardingSkills]
      .map((row) => row.content)
      .filter(Boolean)
      .join("、"),
    regionCount: areas.length,
    regionLabels: areas.join("、"),
    sizeCount: sizeSkills.length,
    sizeLabels: sizeSkills.map((row) => row.content).join("、"),
    boardingCap: boardingSelected ? boardingCap : null,
    boardingPickup: null,
    applicantName: String(user?.name ?? "").trim(),
    idUploaded: Boolean(idCard?.front && idCard?.back),
    boardingLicenseUploaded: boardingSelected
      ? Array.isArray(user?.certificates) && user.certificates.length > 0
      : null,
    certificateCount: Array.isArray(user?.certificates)
      ? user.certificates.length
      : 0,
  };
}

function userShapeFromSession(session) {
  const profile = session?.profile;
  if (!profile) return null;
  return {
    name: profile.name,
    identity_card: {
      front: profile.identityCardFront,
      back: profile.identityCardBack,
    },
    service_area: profile.serviceAreas,
    services: (profile.services ?? []).map((row) => ({
      service: row.service,
      status: row.status,
      service_name: row.serviceName,
      status_name: row.statusName,
      skills: row.skills ?? [],
    })),
    certificates: profile.certificates ?? [],
    extra_info: profile.extraInfo ?? [],
  };
}

const STEP_PENDING = [
  { n: "1", label: "提交申請", state: "active" },
  { n: "2", label: "審批中", state: "upcoming" },
  { n: "3", label: "未驗證", state: "upcoming" },
];

const STEP_IN_REVIEW = [
  { n: "1", label: "提交申請", state: "done" },
  { n: "2", label: "審批中", state: "active" },
  { n: "3", label: "未驗證", state: "upcoming" },
];

const STEP_ENABLED = [
  { n: "1", label: "提交申請", state: "done" },
  { n: "2", label: "審批中", state: "done" },
  { n: "3", label: "已驗證", state: "active" },
];

function summaryHasApplication(summary) {
  if (!summary) return false;
  if (summary.statusName === "申請中" || summary.statusName === "啟用") {
    return true;
  }
  return (
    Number(summary.serviceCount) > 0 ||
    Number(summary.regionCount) > 0 ||
    summary.idUploaded === true
  );
}

/** 摘要頁步驟條（與下方摘要同一來源；summary 優先） */
export function buildApplySubmittedStepperSteps(session, serviceId, summary) {
  if (summaryHasApplication(summary)) {
    return summary?.statusName === "啟用" ? STEP_ENABLED : STEP_IN_REVIEW;
  }

  const row =
    serviceRowForApply(userShapeFromSession(session), serviceId) ??
    serviceRowFromList(session?.profile?.services, serviceId);
  if (!row) {
    return session?.applySubmitMessage ? STEP_IN_REVIEW : STEP_PENDING;
  }

  const status =
    row.status != null && Number.isFinite(Number(row.status))
      ? Number(row.status)
      : 1;
  const name = statusName(row);
  if (status === 2 || name === "啟用") return STEP_ENABLED;
  return STEP_IN_REVIEW;
}

/**
 * 申請表單步驟條（`/apply/pet`、`/apply/repair`，含 `?edit=1`）。
 * 只看 profile `services` 裡同一個 service id：1 申請中 → 審批中；2 啟用 → 已驗證；
 * 無紀錄／其他（例如 3 停用、重新申請）→ 提交申請。
 */
export function buildApplyFormStepperSteps(session, serviceId) {
  const application = serviceApplicationFromProfile(session?.profile, serviceId);
  if (application?.status === 2) return STEP_ENABLED;
  if (application?.status === 1) return STEP_IN_REVIEW;
  return STEP_PENDING;
}

export function buildSubmittedSummaryFromSession(session, serviceId) {
  const user = userShapeFromSession(session);
  if (!user) return null;
  const summary = buildSubmittedSummaryFromUser(user, serviceId);
  if (session?.applySubmitMessage) {
    summary.message = session.applySubmitMessage;
  } else if (summary.statusName === "申請中") {
    summary.message = "申請審批中";
  } else if (summary.statusName === "啟用") {
    summary.message = "服務已啟用";
  } else {
    summary.message = "申請已提交";
  }
  return summary;
}

/** 提交成功：用 API `data.user` 更新 session，供提交成功页读取（不用 sessionStorage）。 */
export function primeSessionAfterApply(currentSession, apiResult, serviceId) {
  const user = apiResult?.data?.user;
  const parsed = sessionFromProfileResponse({
    status: true,
    data: { user },
  });
  const next = {
    ...(currentSession?.authenticated ? currentSession : {}),
    ...parsed,
    phone: currentSession?.phone ?? parsed.phone,
    applySubmitMessage: apiResult?.message ?? "申請已提交",
    lastAppliedServiceId: Number(serviceId),
  };
  primeSessionCache(next);
  return next;
}
