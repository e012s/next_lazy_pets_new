"use client";
import { iconSrc } from "@/icons/sources";

import { navigate } from "@/lib/navigation";
import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FeeCard, InfoRow, orderDetailCardClass } from "@/components/OrderBlocks";
import { PhotoRow } from "@/components/PhotoRow";
import { ShellNotice } from "@/components/ShellNotice";
import { useRepairQuote } from "@/components/repair/RepairQuoteProvider";
import { resolveOrderDetail } from "@/service/orders/detailModel";
import { RegisterDataPrompt, useNeedsRegistration } from "@/components/RegisteredData";

const detailEase = "duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]";
const detailGridMotion = `grid transition-[grid-template-rows] ${detailEase} motion-reduce:transition-none motion-reduce:duration-0`;
const detailFadeMotion = `transition-opacity ${detailEase} motion-reduce:transition-none motion-reduce:duration-0`;
const chevronMotion = `transition-transform ${detailEase} motion-reduce:transition-none motion-reduce:duration-0`;

function HeaderKindIcon({ kind }) {
  if (kind === "repair") return <img src={iconSrc["repair-ac"]} alt="" aria-hidden className="inline-block object-contain size-12 shrink-0" />;
  if (kind === "boarding") return <img src={iconSrc["pet-boarding"]} alt="" aria-hidden className="inline-block object-contain size-12 shrink-0" />;
  return <img src={iconSrc["pet-walk"]} alt="" aria-hidden className="inline-block object-contain size-12 shrink-0" />;
}

/**
 * @param {{ variant: "pet" | "boarding" |"repair"; id?: string }} props
 */
export default function OrderDetail({ variant, id }) {
  const pathname = usePathname();
  const [detailsOpen, setDetailsOpen] = useState(true);
  const { openQuote } = useRepairQuote();
  const needsRegistration = useNeedsRegistration();
  const model = resolveOrderDetail(variant, id);

  useLayoutEffect(() => {
    setDetailsOpen(true);
  }, [pathname, id]);

  if (needsRegistration) {
    return (
      <div className="space-y-3 px-5 py-4">
        <RegisterDataPrompt afterRegistered="即可查看訂單。" />
      </div>
    );
  }

  if (!model) {
    const message =
      variant === "repair" ? "找不到這張維修訂單。" : "找不到這張寵物訂單。";
    return <p className="px-4 py-8 text-sm text-[#797979]">{message}</p>;
  }

  return (
    <div className="space-y-3 px-5 py-4">
      <section className="px-1">
        <div className="flex gap-3">
          <HeaderKindIcon kind={model.headerIcon} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-[15px] font-medium text-[#4d5257]">
                {model.title} · #{model.code}
              </h2>
              <button
                type="button"
                aria-expanded={detailsOpen}
                aria-label={detailsOpen ? "收起訂單詳情" : "展開訂單詳情"}
                onClick={() => setDetailsOpen((open) => !open)}
                className="shrink-0 text-chevron"
              >
                <i
                  className={`f7-icons size-5 ${chevronMotion} ${!detailsOpen ? " -rotate-180" : ""}`}
                  aria-hidden
                >
                  chevron_down
                </i>
              </button>
            </div>
            {model.metaLines.map((line, index) => (
              <p
                key={line}
                className={`text-[13px] leading-5 text-[#797979] ${index === 0 ? " mt-1" : " mt-0.5"} ${variant === "boarding" && index === 1 ? " text-[#0091b2]" : ""}`}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      {model.notice ? <ShellNotice>{model.notice}</ShellNotice> : null}

      <section className={orderDetailCardClass}>
        <div
          className={`${detailGridMotion} ${detailsOpen ? " grid-rows-[0fr]" : " grid-rows-[1fr]"}`}
        >
          <div
            className={`min-h-0 overflow-hidden ${detailFadeMotion} ${detailsOpen ? " opacity-0" : " opacity-100"}`}
          >
            <button
              type="button"
              aria-expanded={false}
              aria-label="展開訂單詳情"
              onClick={() => setDetailsOpen(true)}
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <span className="text-[15px] font-medium text-[#4d5257]">訂單詳情</span>
              <i
                className={`f7-icons size-5 shrink-0 -rotate-180 text-chevron ${chevronMotion}`}
                aria-hidden
              >
                chevron_down
              </i>
            </button>
          </div>
        </div>

        <div
          className={`${detailGridMotion} ${detailsOpen ? " grid-rows-[1fr]" : " grid-rows-[0fr]"}`}
        >
          <div
            className={`min-h-0 overflow-hidden ${detailFadeMotion} ${detailsOpen ? " opacity-100 delay-75" : " opacity-0"}`}
          >
            <div className="space-y-0">
              <div className="divide-y divide-[#eef0f3]">
                {model.rows.map((row) => (
                  <div key={row.label} className="py-3 first:pt-0">
                    <InfoRow icon={row.icon} label={row.label} value={row.value} />
                  </div>
                ))}
              </div>
              {(model.photos?.length ?? 0) > 0 || (model.photoCount ?? 0) > 0 ? (
                <div className="border-t border-[#eef0f3] pt-3">
                  <PhotoRow count={model.photoCount} photos={model.photos} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {model.fee ? (
        <FeeCard
          orderTotal={model.fee.orderTotal}
          orderTotalLabel={model.fee.orderTotalLabel}
          platformFee={model.fee.platformFee}
          income={model.fee.income}
          incomeLabel={model.fee.incomeLabel}
          incomeFormula={model.fee.incomeFormula}
          payoutNote={model.fee.payoutNote}
        />
      ) : null}

      <div>
        {variant === "repair" ? (
          <button type="button" className="inline-flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand px-4 text-title font-medium text-white transition active:bg-brand-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" onClick={openQuote}>
            確認接單
            <i className="f7-icons size-4" aria-hidden>chevron_right</i>
          </button>
        ) : (
          <button type="button" onClick={() => navigate(model.confirmHref, "replace")} className="inline-flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand px-4 text-title font-medium text-white transition active:bg-brand-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
            確認接單
            <i className="f7-icons size-4" aria-hidden>chevron_right</i>
          </button>
        )}
      </div>
    </div>
  );
}
