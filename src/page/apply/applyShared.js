"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRefreshSession, useSession } from "@/context/SessionContext";
import { useThirdPartyGlobal } from "@/context/ThirdPartyGlobalContext";
import { navigate } from "@/lib/navigation";
import { fetchThirdPartySkills } from "@/service/apply/applyApi";
import {
  buildApplyFormStepperSteps,
  primeSessionAfterApply,
  serviceApplicationFromProfile,
} from "@/service/apply/applyStatus";
import { shouldPrefillExistingApplication } from "@/service/apply/applyForm";
import { applyRegionsFromGlobal } from "@/service/catalog/thirdPartyGlobal";

/** Loads `retrieve_third_party_skills` for one service (1 repair / 2 pet). */
function useApplyThirdPartySkills(serviceId) {
  const [services, setServices] = useState(null);
  const [error, setError] = useState(null);

  /** Each form mounts with one fixed `serviceId` (pet ↔ repair remounts), so no reset needed. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchThirdPartySkills({ service: serviceId });
      if (cancelled) return;
      if (result?.status && Array.isArray(result.data?.services)) {
        setServices(result.data.services);
        return;
      }
      setServices([]);
      setError(result?.message?.trim() || "載入服務技能失敗");
    })();

    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  return { ready: services !== null, services, error };
}

/** 已申請中／已啟用 → 摘要頁；`?edit=1` 則留在表單（預填資料）。 */
function useRedirectIfServiceAlreadyApplied(serviceId, { allowEdit = false } = {}) {
  const session = useSession();

  useEffect(() => {
    if (allowEdit) return;
    const application = serviceApplicationFromProfile(session?.profile, serviceId);
    if (application?.status === 1 || application?.status === 2) {
      navigate(`/apply/submitted?service=${serviceId}`, "replace");
    }
  }, [session?.profile, serviceId, allowEdit]);
}

const PREVIEW_FILE_KEY = {
  profilePreview: "profileFile",
  idFrontPreview: "idFrontFile",
  idBackPreview: "idBackFile",
  boardingLicensePreview: "boardingLicenseFile",
};

/**
 * Shared state + flow for the pet / repair apply forms.
 * `config` must be a module-level constant (stable references):
 * `{ serviceId, buildCatalog, emptyCatalog, isCatalogReady, formFromSession,
 *    emptyFormFromSession, validate, send }`.
 */
export function useApplyForm(config) {
  const {
    serviceId,
    buildCatalog,
    emptyCatalog,
    isCatalogReady,
    formFromSession,
    emptyFormFromSession,
    validate,
    send,
  } = config;
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "1";
  useRedirectIfServiceAlreadyApplied(serviceId, { allowEdit: isEdit });
  const session = useSession();
  const refreshSession = useRefreshSession();
  const { global, ready: globalReady } = useThirdPartyGlobal();
  const [formBootstrapped, setFormBootstrapped] = useState(false);
  const { ready, services: skillServices, error: skillsError } =
    useApplyThirdPartySkills(serviceId);
  const regionOptions = useMemo(() => applyRegionsFromGlobal(global), [global]);
  const stepperSteps = useMemo(
    () => buildApplyFormStepperSteps(session, serviceId),
    [session, serviceId],
  );
  const catalog = useMemo(
    () => (skillServices ? buildCatalog(skillServices) : emptyCatalog),
    [skillServices, buildCatalog, emptyCatalog],
  );
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!globalReady || !ready || !isCatalogReady(catalog) || formBootstrapped) return;
    let cancelled = false;
    (async () => {
      const sessionData = await refreshSession();
      if (cancelled) return;
      const prefill =
        isEdit || shouldPrefillExistingApplication(sessionData, serviceId);
      setForm(
        (prev) =>
          prev ??
          (prefill
            ? formFromSession(sessionData, catalog, global)
            : emptyFormFromSession(sessionData, catalog, global)),
      );
      setFormBootstrapped(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    globalReady,
    ready,
    catalog,
    global,
    refreshSession,
    formBootstrapped,
    isEdit,
    serviceId,
    isCatalogReady,
    formFromSession,
    emptyFormFromSession,
  ]);

  function patchForm(patch) {
    setForm((prev) => ({ ...prev, ...patch }));
  }
  function toggleList(key, value) {
    setForm((prev) => {
      const list = prev[key];
      const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...prev, [key]: next };
    });
  }
  function setDobValue(value) {
    patchForm({ dob: value, dobError: "" });
  }
  /** Replace a preview (`profilePreview`, `idFrontPreview`, …) and keep its File for upload. */
  function setPreview(key, file) {
    const fileKey = PREVIEW_FILE_KEY[key];
    setForm((prev) => {
      const old = prev[key];
      if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
      const next = { ...prev, [key]: URL.createObjectURL(file) };
      if (fileKey) next[fileKey] = file;
      return next;
    });
  }
  function clearPreview(key) {
    const fileKey = PREVIEW_FILE_KEY[key];
    setForm((prev) => {
      const old = prev[key];
      if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
      const next = { ...prev, [key]: "" };
      if (fileKey) next[fileKey] = null;
      return next;
    });
  }

  async function submit() {
    if (submitting) return;
    const check = validate(session, form, catalog);
    if (!check.ok) {
      patchForm({
        error: check.message,
        dobError: check.dobError ?? "",
      });
      return;
    }
    patchForm({ error: "", dobError: "" });
    setSubmitting(true);
    try {
      const result = await send({ session, form, catalog });
      if (!result?.status) {
        patchForm({ error: result?.message ?? "申請提交失敗，請稍後再試。" });
        return;
      }
      primeSessionAfterApply(session, result, serviceId);
      navigate(`/apply/submitted?service=${serviceId}`);
    } finally {
      setSubmitting(false);
    }
  }

  const pageLoading =
    !globalReady || !ready || !form || !isCatalogReady(catalog);

  return {
    session,
    global,
    globalReady,
    ready,
    pageLoading,
    skillsError,
    catalog,
    regionOptions,
    stepperSteps,
    form,
    setForm,
    patchForm,
    toggleList,
    setDobValue,
    setPreview,
    clearPreview,
    submitting,
    submit,
  };
}
