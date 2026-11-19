"use client";
import { iconSrc } from "@/icons/sources";
import { useEffect, useMemo, useState } from "react";
import { useRefreshSession, useSession } from "@/context/SessionContext";
import { useThirdPartyGlobal } from "@/context/ThirdPartyGlobalContext";
import { navigate } from "@/lib/navigation";
import { applyRoleChoicesFromSkills, applyRoleChoicesWithApplication } from "@/service/apply/applyStatus";
const EMPTY_HINT = "暫無可申請的服務類別。";

export default function ApplyRole() {
  const session = useSession();
  const refreshSession = useRefreshSession();
  const { global, error: globalError } = useThirdPartyGlobal();

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const catalog = useMemo(() => {
    const skills = global?.skills;
    return Array.isArray(skills) ? skills : [];
  }, [global]);

  const choices = useMemo(() => {
    if (!global) return [];
    return applyRoleChoicesWithApplication(
      applyRoleChoicesFromSkills(catalog, global),
      session?.profile,
    );
  }, [catalog, global, session?.profile]);

  const emptyMessage =
    globalError?.trim() || EMPTY_HINT;

  const [role, setRole] = useState("");

  /** Invalid / empty `role` falls back to the first choice (derived, no sync effect). */
  const activeRole =
    choices.length > 0 && choices.some((choice) => choice.id === role)
      ? role
      : (choices[0]?.id ?? "");
  const selected = useMemo(
    () => choices.find((choice) => choice.id === activeRole),
    [choices, activeRole],
  );

  if (choices.length === 0) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col px-[15px] pt-[101px] pb-20">
        <h2 className="text-[14px] leading-5 font-medium tracking-normal text-[#4d5257]">
          你最主要做什麼
        </h2>
        <div className="mt-10 rounded-xl border border-[#e8ecef] bg-white px-5 py-10 text-center shadow-[0_8px_24px_rgba(77,82,87,0.04)]">
          <p className="text-[15px] leading-6 text-[#4d5257]">{emptyMessage}</p>
          <button
            type="button"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-[#0091b2] bg-white px-6 text-[14px] font-medium text-[#0091b2] transition active:bg-[#e7f7fb]"
            onClick={() => window.open("https://wa.me/", "_blank", "noopener,noreferrer")}
          >
            聯絡客服
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col px-[15px] pt-[101px] pb-20">
      <h2 className="text-[14px] leading-5 font-medium tracking-normal text-[#4d5257]">你最主要做什麼</h2>
      <p className="mt-[5px] text-[14px] leading-5 font-medium tracking-normal text-[#797979]">
        先選一個主要類別完成登記，之後可以加更多
      </p>
      <div className="mt-5 flex flex-col gap-[35px]">
        {choices.map((choice) => {
          const active = choice.id === activeRole;
          const icon = choice.icon ?? (choice.skillId === 2 ? "apply-pet" : "apply-repair");
          return (
            <button
              key={choice.skillId}
              type="button"
              aria-pressed={active}
              onClick={() => setRole(choice.id)}
              className={`flex h-[90px] w-full items-center gap-[15px] rounded-lg bg-white px-5 text-left ${active ? " border-2 border-[#0091b2]" : " border border-[#c6ccd2]"}`}
            >
              <img src={iconSrc[icon]} alt="" aria-hidden className="size-[50px] shrink-0 object-contain" />
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="text-[14px] leading-5 font-semibold tracking-normal text-[#4d5257]">
                    {choice.title}
                  </span>
                  {choice.application?.statusName ? (
                    <span className="rounded-full bg-[#e7f7fb] px-2 py-0.5 text-[11px] font-medium text-[#0091b2]">
                      {choice.application.statusName}
                    </span>
                  ) : null}
                </span>
                <span className="mt-px block text-[12px] leading-[17px] font-normal tracking-normal text-[#797979]">
                  {choice.detail}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2.5 text-[14px] leading-5 font-medium tracking-normal text-[#797979]">
        登記後可隨時在「我的專家檔案」加入更多類別
      </p>
      <div className="mt-[35px] rounded-[10px] bg-[#caeef7] px-5 py-5 text-[#0091b2]">
        <div className="flex items-center gap-1.5">
          <img src={iconSrc["info"]} alt="" aria-hidden className="inline-block object-contain size-4 shrink-0" />
          <p className="text-[14px] leading-5 font-semibold tracking-normal">完成步驟1即送 $200 儲值金</p>
        </div>
        <p className="mt-[5px] text-[14px] leading-5 font-normal tracking-normal">用於頭10次報價，免費試用</p>
      </div>
      <div className="mt-auto flex justify-center pt-8">
        <button
          type="button"
          disabled={!selected}
          onClick={() => selected && navigate(selected.href ?? "/apply/role")}
          className="inline-flex h-12 w-[275px] items-center justify-center gap-1 rounded-lg bg-[#0091b2] px-3 text-[16px] leading-5 font-bold tracking-normal text-white disabled:opacity-50"
        >
          <span className="min-w-0 text-center">
            {selected?.actionLabel ?? selected?.next ?? "下一步"}
          </span>
          <i className="f7-icons size-4 font-bold" aria-hidden>chevron_right</i>
        </button>
      </div>
    </div>
  );
}