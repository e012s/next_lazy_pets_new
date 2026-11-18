"use client";

import { useEffect, useMemo, useState } from "react";
import { iconSrc } from "@/icons/sources";
import {
  primeSessionCache,
  useRefreshSession,
  useSession,
} from "@/context/SessionContext";
import { accountFor } from "@/service/mock/accounts";
import { loadRegisteredCategories } from "@/service/catalog/expertCategories";
import { clearAuthStorage } from "@/lib/preferences";
import { navigate } from "@/lib/navigation";
import { ApplySummaryChip } from "@/components/apply/applyUi";
import appConfig from "../../../appconfig.json";

const roleLabel = {
  pet: "寵物服務",
  repair: "維修安裝服務",
};

const SERVICE_ID_TO_KEY = { 1: "repair", 2: "pet" };

function profileServiceChips(profile) {
  const rows = profile?.services;
  if (!Array.isArray(rows) || rows.length === 0) return [];
  return rows
    .map((row) => {
      const serviceId = Number(row?.service);
      const key = SERVICE_ID_TO_KEY[serviceId];
      if (!key) return null;
      const skills = Array.isArray(row.skills) ? row.skills : [];
      const skillLabels = skills
        .map((item) => String(item?.content ?? "").trim())
        .filter(Boolean);
      return {
        serviceId,
        key,
        label:
          String(row.serviceName ?? row.service_name ?? "").trim() ||
          roleLabel[key],
        skillLabels,
        active: Number(row.status) === 2,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.serviceId - b.serviceId);
}

function formatPhone(phone) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.length !== 8) return digits || "—";
  return `+852 ${digits.slice(0, 4)} ${digits.slice(4)}`;
}

function formatBirthDate(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function serviceAreaText(profile) {
  const areas = profile?.serviceAreas;
  if (!Array.isArray(areas) || areas.length === 0) return "";
  return areas
    .map((row) => {
      if (typeof row === "string") return row.trim();
      return String(row?.name ?? row?.code ?? "").trim();
    })
    .filter(Boolean)
    .join("、");
}

function resolveRegisteredCategories(sessionRegistered, fallbackRole) {
  const stored = loadRegisteredCategories();
  if (stored.length > 0) return stored;
  if (sessionRegistered && (fallbackRole === "pet" || fallbackRole === "repair")) {
    return [fallbackRole];
  }
  return [];
}

function ProfileInfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#eef0f3] py-3.5 last:border-b-0">
      <span className="shrink-0 text-[14px] leading-5 text-[#797979]">{label}</span>
      <span className="max-w-[60%] text-right text-[14px] leading-5 font-bold text-[#4d5257]">
        {value}
      </span>
    </div>
  );
}

function cardClassName(extra = "") {
  return `rounded-2xl bg-white px-5 py-5 shadow-[0_8px_24px_rgba(77,82,87,0.06)] ${extra}`;
}

export default function ExpertProfile() {
  const session = useSession();
  const refreshSession = useRefreshSession();
  const registered = session?.authenticated === true && session?.registered === true;
  const phone = session?.phone ?? "";
  const account = accountFor(phone);
  const role = session?.role ?? account?.role ?? "pet";
  const profile = session?.profile;
  const displayName = profile?.name || "—";
  const avatarSrc = profile?.profileImage ? profile.profileImage : iconSrc["avatar"];

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const serviceChips = useMemo(() => {
    const fromProfile = profileServiceChips(profile);
    if (fromProfile.length > 0) return fromProfile;
    return resolveRegisteredCategories(registered, role).map((cat) => ({
      serviceId: cat === "repair" ? 1 : 2,
      key: cat,
      label: roleLabel[cat],
      skillLabels: [],
      active: false,
    }));
  }, [profile, registered, role]);

  const registeredServiceIds = useMemo(
    () => new Set(serviceChips.map((row) => row.serviceId)),
    [serviceChips],
  );
  const canAddCategory =
    registered &&
    (!registeredServiceIds.has(1) || !registeredServiceIds.has(2));
  const hasPendingApplication = serviceChips.some((row) => !row.active);

  const areaText = useMemo(() => serviceAreaText(profile), [profile]);
  const idUploaded = Boolean(
    profile?.identityCardFront && profile?.identityCardBack,
  );
  const certificateCount = Array.isArray(profile?.certificates)
    ? profile.certificates.length
    : 0;

  const accountRows = useMemo(() => {
    const rows = [];
    if (areaText) rows.push({ label: "服務範圍", value: areaText });
    if (profile?.nameEn) rows.push({ label: "英文姓名", value: profile.nameEn });
    if (profile?.email) rows.push({ label: "電郵", value: profile.email });
    const dob = formatBirthDate(profile?.dateBirth);
    if (dob) rows.push({ label: "出生日期", value: dob });
    rows.push({
      label: "香港身份證",
      value: idUploaded ? "已上傳" : "未上傳",
    });
    if (certificateCount > 0) {
      rows.push({ label: "相關證書", value: `${certificateCount} 項` });
    }
    return rows;
  }, [profile, areaText, idUploaded, certificateCount]);

  const statusMessage = (() => {
    if (!registered) return "尚未完成專家註冊，完成後即可接單。";
    if (serviceChips.length === 0) {
      return "你已完成一項專家註冊，可以再加多一項服務類別。";
    }
    if (serviceChips.length >= 2) {
      const allActive = serviceChips.every((row) => row.active);
      return allActive
        ? "你已登記寵物同維修服務，可接兩邊嘅單。"
        : "你已提交兩項服務申請，審批完成後即可接單。";
    }
    const only = serviceChips[0];
    return only?.active
      ? "服務已啟用，可以開始接單。"
      : "服務申請審批中，完成後即可接單。";
  })();

  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      /* still clear client state */
    }
    clearAuthStorage();
    primeSessionCache({ authenticated: false });
    navigate("/login", "replace");
  }

  const showServiceDetail = serviceChips.some((row) => row.skillLabels.length > 0);

  return (
    <div className="space-y-4 px-4 pb-10 pt-6">
      <div className={`flex flex-col items-center py-8 ${cardClassName()}`}>
        <img
          src={avatarSrc}
          alt=""
          className="size-20 rounded-full object-cover"
        />
        <h2 className="mt-4 text-[20px] font-bold leading-7 text-[#4d5257]">
          {displayName}
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-[#797979]">{formatPhone(phone)}</p>
        {serviceChips.length > 0 ? (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {serviceChips.map((row) => (
              <span
                key={row.serviceId}
                className="inline-flex rounded-full bg-[#e7f7fb] px-3 py-1 text-[12px] font-medium text-[#0091b2]"
              >
                {row.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 inline-flex rounded-full bg-[#eef0f2] px-3 py-1 text-[12px] font-medium text-[#797979]">
            未登記
          </p>
        )}
        <p className="mt-4 text-center text-[14px] leading-5 text-[#797979]">{statusMessage}</p>
        {!registered ? (
          <button
            type="button"
            onClick={() => navigate("/apply/role")}
            className="mt-5 inline-flex h-11 w-full max-w-xs items-center justify-center rounded-xl bg-brand px-4 text-title font-medium text-white transition active:bg-brand-active"
          >
            完成註冊
          </button>
        ) : null}
        {canAddCategory ? (
          <button
            type="button"
            onClick={() => navigate("/apply/role")}
            className="mt-5 inline-flex h-11 w-full max-w-xs items-center justify-center rounded-xl border border-[#0091b2] bg-white px-4 text-title font-medium text-[#0091b2] transition active:bg-[#e7f7fb]"
          >
            加入更多服務類別
          </button>
        ) : null}
        {!canAddCategory && registered && hasPendingApplication ? (
          <button
            type="button"
            onClick={() => navigate("/apply/role")}
            className="mt-5 inline-flex h-11 w-full max-w-xs items-center justify-center rounded-xl border border-[#0091b2] bg-white px-4 text-title font-medium text-[#0091b2] transition active:bg-[#e7f7fb]"
          >
            補充申請資料
          </button>
        ) : null}
      </div>

      {accountRows.length > 0 ? (
        <section className={cardClassName()}>
          <h3 className="text-[16px] font-bold leading-6 text-[#4d5257]">基本資料</h3>
          <div className="mt-1">
            {accountRows.map((row) => (
              <ProfileInfoRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        </section>
      ) : null}

      {showServiceDetail ? (
        <section className={cardClassName()}>
          <h3 className="text-[16px] font-bold leading-6 text-[#4d5257]">服務內容</h3>
          <div className="mt-3 space-y-4">
            {serviceChips.map((row) =>
              row.skillLabels.length > 0 ? (
                <div key={row.serviceId}>
                  <p className="text-[14px] font-bold leading-5 text-[#4d5257]">
                    {row.label}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {row.skillLabels.map((item) => (
                      <ApplySummaryChip key={`${row.serviceId}-${item}`}>
                        {item}
                      </ApplySummaryChip>
                    ))}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </section>
      ) : null}

      <button
        type="button"
        disabled={loggingOut}
        onClick={logout}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#dfe3e6] bg-white px-4 text-[16px] font-medium text-[#d95959] transition active:bg-[#f3f5f7] disabled:opacity-60"
      >
        {loggingOut ? "登出中…" : "登出"}
      </button>

      <p className="text-center text-micro text-[#797979]">{appConfig.version} 版本</p>
    </div>
  );
}