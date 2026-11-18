"use client";
import { iconSrc } from "@/icons/sources";

import { navigate } from "@/lib/navigation";
import { useRepairQuote } from "@/components/repair/RepairQuoteProvider";
import { repairJob } from "@/service/mock/repair";
import { money } from "@/lib/format";
import {
  findTaskCardClass,
  FindTaskCardRow,
  findTaskCardActionsClass,
  findTaskOutlineBtn,
  findTaskPrimaryBtn,
  findTaskRowListClass,
} from "@/components/findTasks/FindTaskCardRow";
export function RepairJobCard() {
  const job = repairJob;
  const { openQuote } = useRepairQuote();

  return (
    <article className={findTaskCardClass}>
      <div className="flex gap-3">
        <img src={iconSrc["repair-ac"]} alt="" aria-hidden className="inline-block object-contain size-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-title font-bold text-foreground">
              {job.title} • #{job.id}
            </h2>
            <span className="shrink-0 rounded-full bg-[#e5f6fb] px-2.5 py-1 text-caption font-medium text-brand">
              {job.badge}
            </span>
          </div>
          <p className="mt-1 text-body font-normal text-muted">
            {job.published} • {job.expires}
          </p>
        </div>
      </div>
      <ul className={findTaskRowListClass}>
        <FindTaskCardRow iconSrc={iconSrc["budget"]} label="客人預算">
          <div className="text-[13px] font-normal text-muted">
            <span className="text-display font-bold leading-none text-brand">{job.budgetLabel}</span>
            <span>
              {" • 報價費 "}
              {money(job.quoteFee)}
              <span>（客人檢閱報價後才會扣除）</span>
            </span>
          </div>
        </FindTaskCardRow>
        <FindTaskCardRow iconSrc={iconSrc["order-clock"]} label="指定服務日期">
          {job.schedule}
        </FindTaskCardRow>
        <FindTaskCardRow iconSrc={iconSrc["order-location"]} label="地區">
          {job.area}
        </FindTaskCardRow>
        <FindTaskCardRow
          iconSrc={iconSrc["order-add-ons"]}
          label="維修詳情"
          valueClassName="text-[14px] font-normal leading-5 text-muted"
        >
          {job.listDetail}
        </FindTaskCardRow>
      </ul>
      <div className={findTaskCardActionsClass}>
        <button type="button" className={findTaskOutlineBtn} onClick={() => navigate(`/repair/${job.id}`)}>
          查看訂單詳情
        </button>
        <button type="button" className={findTaskPrimaryBtn} onClick={openQuote}>
          接單
        </button>
      </div>
    </article>
  );
}
