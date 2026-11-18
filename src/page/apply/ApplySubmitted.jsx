"use client";
import { iconSrc } from "@/icons/sources";
import { navigate } from "@/lib/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useRefreshSession, useSession } from "@/context/SessionContext";
import { ApplySummaryChip } from "@/components/apply/applyUi";
import { buildApplySubmittedStepperSteps, buildSubmittedSummaryFromSession } from "@/service/apply/applyStatus";
function ApplySubmittedStepper({ steps }) {
  return (
    <ol className="flex w-full items-start px-10 pt-6">
      {steps.flatMap((step, index) => {
        const nodes = [];
        if (index > 0) {
          const prev = steps[index - 1];
          nodes.push(
            <li
              key={`step-line-${index}`}
              className="flex h-7 min-w-5 flex-1 items-center"
              aria-hidden
            >
              <span
                className={`h-0.5 w-full${prev?.state === "done" ? " bg-brand" : " bg-[#c6ccd2]"}`}
              />
            </li>,
          );
        }
        nodes.push(
          <li
            key={step.label}
            className="flex shrink-0 flex-col items-center text-center"
          >
            <span
              className={`flex size-7 items-center justify-center rounded-full text-[14px] leading-5 font-bold${step.state === "done" ? " bg-brand text-white" : ""} ${step.state === "active" ? " bg-brand text-white" : ""} ${step.state === "upcoming" ? " border-2 border-[#b9b9b9] bg-white text-[#b9b9b9]" : ""}`}
            >
              {step.n}
            </span>
            <span
              className={`mt-1.5 block text-[13px] leading-5${step.state === "active" ? " font-bold text-brand" : " font-normal text-muted"}`}
            >
              {step.label}
            </span>
          </li>,
        );
        return nodes;
      })}
    </ol>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#eef0f3] py-3.5 last:border-b-0">
      <span className="shrink-0 text-[14px] leading-5 font-normal text-muted">
        {label}
      </span>
      <span className="max-w-[58%] text-right text-[14px] leading-5 font-bold">
        {value}
      </span>
    </div>
  );
}

function splitDetailItems(text) {
  if (!text) return [];
  return String(text)
    .split("、")
    .map((part) => part.trim())
    .filter(Boolean);
}

function summaryExpandable(label, detailText, countFallback, unit = "項") {
  const items = splitDetailItems(detailText);
  const count = items.length > 0 ? items.length : Number(countFallback) || 0;
  if (count === 0) {
    return { kind: "plain", label, value: `0 ${unit}` };
  }
  if (items.length === 0) {
    return { kind: "plain", label, value: `${count} ${unit}` };
  }
  return {
    kind: "expandable",
    label,
    count,
    unit,
    items,
  };
}

function SummaryExpandableRow({ label, count, unit, items }) {
  const [open, setOpen] = useState(false);
  const canToggle = items.length > 0;

  return (
    <div className="border-b border-[#eef0f3] py-3.5 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <span className="shrink-0 text-[14px] leading-5 font-normal text-muted">
          {label}
        </span>
        <button
          type="button"
          disabled={!canToggle}
          onClick={() => setOpen((prev) => !prev)}
          className="-my-1 -mr-1 inline-flex shrink-0 items-center gap-1 rounded-md py-1.5 pr-1 pl-2 disabled:cursor-default"
          aria-expanded={open}
          aria-label={open ? `收合${label}` : `展開${label}`}
        >
          <span className="tabular-nums text-[14px] leading-5 font-bold text-[#4d5257]">
            {count} {unit}
          </span>
          {canToggle ? (
            <i
              className={`f7-icons size-4 shrink-0 text-muted transition-transform${open ? " rotate-180" : ""}`}
              aria-hidden
            >
              chevron_down
            </i>
          ) : null}
        </button>
      </div>
      {open && canToggle ? (
        <div className="mt-2.5 flex w-full flex-wrap gap-2">
          {items.map((item) => (
            <ApplySummaryChip key={item}>{item}</ApplySummaryChip>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SummaryRowRenderer({ row }) {
  if (row.kind === "expandable") {
    return (
      <SummaryExpandableRow
        label={row.label}
        count={row.count}
        unit={row.unit}
        items={row.items}
      />
    );
  }
  return <SummaryRow label={row.label} value={row.value} />;
}

function yesNo(uploaded) {
  return uploaded ? "已上傳" : "未上傳";
}

function plainRow(label, value) {
  return { kind: "plain", label, value };
}

function repairSummaryRows(summary) {
  const rows = [plainRow("申請類別", summary.category)];
  if (summary.statusName) {
    rows.push(plainRow("審批狀態", summary.statusName));
  }
  if (summary.applicantName) {
    rows.push(plainRow("申請人", summary.applicantName));
  }
  rows.push(
    summaryExpandable(
      "已選服務",
      summary.serviceLabels,
      summary.serviceCount,
      "項",
    ),
  );
  rows.push(
    summaryExpandable(
      "服務地區",
      summary.regionLabels,
      summary.regionCount,
      "區",
    ),
  );
  rows.push(plainRow("香港身份證", yesNo(summary.idUploaded)));
  rows.push(
    plainRow(
      "相關牌照",
      `${summary.licenseFilled} / ${summary.licenseMax} (可後補)`,
    ),
  );
  rows.push(plainRow("過往工程相片", `${summary.photoCount} 張`));
  return rows;
}

function petSummaryRows(summary) {
  const rows = [plainRow("申請類別", summary.category)];
  if (summary.statusName) {
    rows.push(plainRow("審批狀態", summary.statusName));
  }
  if (summary.applicantName) {
    rows.push(plainRow("申請人", summary.applicantName));
  }
  rows.push(
    summaryExpandable(
      "已選服務",
      summary.serviceLabels,
      summary.serviceCount,
      "項",
    ),
  );
  rows.push(
    summaryExpandable(
      "服務地區",
      summary.regionLabels,
      summary.regionCount,
      "區",
    ),
  );
  rows.push(
    summaryExpandable(
      "可接受體型",
      summary.sizeLabels,
      summary.sizeCount,
      "項",
    ),
  );
  if (summary.boardingCap) {
    rows.push(plainRow("寄宿可接數量", summary.boardingCap));
    if (summary.boardingPickup) {
      rows.push(plainRow("寄宿接送", summary.boardingPickup));
    }
    if (summary.boardingLicenseUploaded != null) {
      rows.push(
        plainRow("動物寄養所牌照", yesNo(summary.boardingLicenseUploaded)),
      );
    }
  }
  rows.push(plainRow("香港身份證", yesNo(summary.idUploaded)));
  rows.push(
    plainRow("其他相關證書", `${summary.certificateCount} 項 (可後補)`),
  );
  return rows;
}

export default function ApplySubmitted() {
  const searchParams = useSearchParams();
  const session = useSession();
  const refreshSession = useRefreshSession();

  const serviceId = useMemo(() => {
    const fromQuery = Number(searchParams.get("service"));
    if (fromQuery === 1 || fromQuery === 2) return fromQuery;
    const fromSession = Number(session?.lastAppliedServiceId);
    if (fromSession === 1 || fromSession === 2) return fromSession;
    return 2;
  }, [searchParams, session?.lastAppliedServiceId]);

  const summary = useMemo(() => {
    if (session?.authenticated !== true) return null;
    return buildSubmittedSummaryFromSession(session, serviceId);
  }, [session, serviceId]);

  const stepperSteps = useMemo(
    () => buildApplySubmittedStepperSteps(session, serviceId, summary),
    [session, serviceId, summary],
  );

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const rows = summary
    ? summary.kind === "pet"
      ? petSummaryRows(summary)
      : repairSummaryRows(summary)
    : null;
  const editHref = summary?.kind === "pet" ? "/apply/pet" : "/apply/repair";
  const headline = summary?.message?.trim() || "申請已提交";

  return (
    <div className="bg-[#f9fafc] px-[15px] pb-10">
      <ApplySubmittedStepper steps={stepperSteps} />

      <div className="mt-8 text-center">
        <div className="mx-auto flex items-center justify-center overflow-hidden rounded-full">
          <img
            src={iconSrc["submitted"]}
            alt=""
            aria-hidden
            className="inline-block size-[80px] object-contain"
          />
        </div>
        <h2 className="mt-5 text-[20px] leading-7 font-bold">{headline}</h2>
        <p className="mx-auto mt-2 max-w-[320px] text-[14px] leading-5 font-normal text-muted">
          我們會於 1–2 個工作天內完成審批，結果會以短訊及 App 通知你。
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-[#c6ccd2] bg-white px-4 py-1">
        {rows ? (
          rows.map((row) => <SummaryRowRenderer key={row.label} row={row} />)
        ) : (
          <p className="py-6 text-center text-[14px] leading-5 text-muted">
            載入申請摘要…
          </p>
        )}
      </div>

      {summary ? (
        <button
          type="button"
          onClick={() => navigate(`${editHref}?edit=1`)}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-lg border border-brand bg-white text-[16px] leading-6 font-bold text-brand"
        >
          修改申請
        </button>
      ) : null}
      <p className="mt-4 text-center text-[12px] leading-[18px] font-normal text-muted">
        修改後需重新審批，通常 1–2 個工作天
      </p>
    </div>
  );
}