"use client";
import { iconSrc } from "@/icons/sources";

import { navigate } from "@/lib/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { orderDetailCardClass } from "@/components/OrderBlocks";
import { getTask } from "@/service/mock/tasks";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { RegisterDataPrompt, useNeedsRegistration } from "@/components/RegisteredData";

export default function AcceptSuccess({ id }) {
  const needsRegistration = useNeedsRegistration();
  const [mounted, setMounted] = useState(false);
  const task = id ? getTask(id) : undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  useLockBodyScroll(mounted && Boolean(task?.acceptSuccess));

  if (needsRegistration) {
    return (
      <div className="px-5 py-4">
        <RegisterDataPrompt afterRegistered="即可查看訂單。" />
      </div>
    );
  }

  if (!task?.acceptSuccess) {
    return <p className="px-4 py-8 text-sm text-[#797979]">找不到這張訂單。</p>;
  }

  const { notice, address, scheduleLabel, schedule } = task.acceptSuccess;

  function goFindTasks() {
    navigate("/find", "replace");
  }

  if (!mounted) {
    return <div className="min-h-[50vh]" aria-hidden />;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accept-success-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#102028]/45"
        aria-label="關閉並返回尋找任務"
        onClick={goFindTasks}
      />

      <div className="relative flex h-full w-full max-w-[500px] flex-col justify-end pointer-events-none">
        <div className="pointer-events-auto flex max-h-[min(88dvh,640px)] flex-col rounded-t-[20px] bg-white px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(16,40,48,0.12)]">
          <div className="flex justify-end">
            <button
              type="button"
              aria-label="關閉"
              onClick={goFindTasks}
              className="inline-flex shrink-0 items-center justify-center text-muted"
            >
              <img src={iconSrc["close"]} alt="" aria-hidden className="inline-block object-contain size-6" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto text-center">
            <img src={iconSrc["accept-order"]} alt="" aria-hidden className="inline-block object-contain size-[72px] shrink-0 rounded-full" />

            <h2 id="accept-success-title" className="mt-4 text-[22px] font-bold leading-8 text-[#4d5257]">
              你已成功接單
            </h2>
            <p className="mt-2 text-[14px] leading-5 text-[#797979]">{notice}</p>

            <section className={`${orderDetailCardClass} mt-6 w-full text-left shadow-none`}>
              {address ? (
                <div
                  className={`py-3 first:pt-0${schedule ? " border-b border-[#eef0f3]" : " pb-0"}`}
                >
                  <div className="flex gap-3">
                    <img src={iconSrc["order-location"]} alt="" aria-hidden className="inline-block object-contain mt-0.5 size-4 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold">地址</p>
                      <p className="mt-1 text-[14px] leading-6 text-muted">{address}</p>
                    </div>
                  </div>
                </div>
              ) : null}
              <div className={`py-3${!address ? " pt-0 pb-0" : ""}`}>
                <div className="flex gap-3">
                  <img src={iconSrc["order-clock"]} alt="" aria-hidden className="inline-block object-contain mt-0.5 size-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold">{scheduleLabel}</p>
                    <p className="mt-1 text-[14px] leading-6 text-muted">{schedule}</p>
                  </div>
                </div>
              </div>
            </section>

            <button type="button" onClick={() => navigate("/orders", "replace")} className={`inline-flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand px-4 text-title font-medium text-white transition active:bg-brand-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand mt-6 shrink-0`}>
              查看已接訂單
              <i className="f7-icons size-4" aria-hidden>chevron_right</i>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
