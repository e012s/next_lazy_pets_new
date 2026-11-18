"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { iconSrc } from "@/icons/sources";
import { getAssignment } from "@/service/mock/assignments";
import { getBoardingNotice } from "@/service/mock/boardingNotices";
import { navigate } from "@/lib/navigation";
import { money } from "@/lib/format";
import { usePhotoBrowser } from "@/components/PhotoBrowser/PhotoBrowserProvider";
import { ContactGuestLink } from "@/components/ContactGuestLink";
import {
  InfoRow,
  orderDetailCardClass,
} from "@/components/OrderBlocks";
import {
  RegisterDataPrompt,
  useNeedsRegistration,
} from "@/components/RegisteredData";
import {
  repairDetailFromAssignment,
  resolveMyOrderDetailLayout,
} from "@/service/orders/detailModel";
import { BoardingNoticeSheet } from "@/components/orders/BoardingNoticeSheet";
import { useOrderServiceLive } from "@/hooks/useOrderServiceLive";

const detailEase = "duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]";
const detailGridMotion = `grid transition-[grid-template-rows] ${detailEase} motion-reduce:transition-none motion-reduce:duration-0`;
const detailFadeMotion = `transition-opacity ${detailEase} motion-reduce:transition-none motion-reduce:duration-0`;
const chevronMotion = `transition-transform ${detailEase} motion-reduce:transition-none motion-reduce:duration-0`;

function HeaderIcon({ kind }) {
  if (kind === "repair") {
    return (
      <img
        src={iconSrc["repair-ac"]}
        alt=""
        aria-hidden
        className="inline-block size-12 shrink-0 object-contain"
      />
    );
  }
  if (kind === "boarding") {
    return (
      <img
        src={iconSrc["pet-boarding"]}
        alt=""
        aria-hidden
        className="inline-block size-[50px] shrink-0 object-contain"
      />
    );
  }
  if (kind === "groom") {
    return (
      <img
        src={iconSrc["pet-groom"]}
        alt=""
        aria-hidden
        className="inline-block size-[50px] shrink-0 object-contain"
      />
    );
  }
  return (
    <img
      src={iconSrc["pet-walk"]}
      alt=""
      aria-hidden
      className="inline-block size-[50px] shrink-0 object-contain"
    />
  );
}

function ContactFooter({ assignment, wrapperClassName = "pb-2 pt-4", buttonClassName }) {
  return (
    <div className={wrapperClassName}>
      <ContactGuestLink
        orderId={assignment.id}
        phoneNumber={assignment.contactPhone}
        className={buttonClassName}
      />
    </div>
  );
}

function WalkPackageDetail({ assignment }) {
  return (
    <div className="space-y-4 px-[15px] py-4">
      <section className="flex items-start gap-3">
        <HeaderIcon kind={assignment.kind} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-[16px] font-bold leading-snug text-[#4d5257]">
              {assignment.title} · {assignment.code}
            </h2>
            <span className="shrink-0 rounded-full bg-[#eef0f2] px-3 py-0.5 text-[12px] font-medium text-[#797979]">
              {assignment.badge}
            </span>
          </div>
          {assignment.packageMeta ? (
            <p className="mt-1 text-[13px] leading-5 text-[#797979]">
              {assignment.packageMeta}
            </p>
          ) : null}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[8px] border border-[#c6ccd2] bg-white px-3 py-3">
          <p className="text-[12px] leading-4 text-[#797979]">
            {assignment.statsPayLabel ?? "服務酬勞 (8 次)"}
          </p>
          <p className="mt-1 text-[22px] font-bold leading-7 text-[#0091b2]">
            {assignment.payMain}
          </p>
        </div>
        <div className="rounded-[8px] border border-[#c6ccd2] bg-white px-3 py-3">
          <p className="text-[12px] leading-4 text-[#797979]">開始日</p>
          <p className="mt-1 text-[22px] font-bold leading-7 text-[#0091b2]">
            {assignment.startDate ?? "—"}
          </p>
        </div>
      </div>

      <section className={`${orderDetailCardClass} divide-y divide-[#eef0f3]`}>
        <div className="py-3 first:pt-0">
          <InfoRow
            icon="pet"
            label="寵物資料"
            value={assignment.petInfo ?? assignment.petProfile ?? ""}
          />
        </div>
        <div className="py-3">
          <InfoRow icon="pin" label="地址" value={assignment.place} />
        </div>
        {assignment.extras ? (
          <div className="py-3 last:pb-0">
            <InfoRow icon="plus" label="額外項目" value={assignment.extras} />
          </div>
        ) : null}
      </section>

      <ContactFooter
        assignment={assignment}
      />
    </div>
  );
}

const boardingPlanTiles = (assignment) => [
  { icon: "/icons/leave.svg", label: "退房", sub: assignment.checkoutAt ?? "", subClass: "text-[#797979]", notice: "reschedule" },
  { icon: "/icons/extend_time.svg", label: "延長寄宿", sub: "客人延長會自動通知", subClass: "text-[#0091b2]", notice: "extend" },
  { icon: "/icons/emergency.svg", label: "緊急聯絡", sub: "客人 + 客服", subClass: "text-[#797979]", notice: "early" },
];

const boardingRowIcon = {
  pet: "animal",
  heart: "animal",
  health: "health",
  vet: "order-doctor",
  phone: "order-contact",
  pin: "order-location",
  plus: "order-add-ons",
  clock: "order-clock",
};

const boardingCardClass = "rounded-[8px] border border-[#c6ccd2] bg-white";

function LogBadge({ tone, children }) {
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-full px-[10px] text-[12px] font-medium leading-normal ${tone === "pending"
          ? "bg-[#ffdcdb] text-[#d95959]"
          : "border border-[#c6ccd2] bg-white text-[#797979]"
        }`}
    >
      {children}
    </span>
  );
}

function DailyPhotoLog({ assignment }) {
  const { open } = usePhotoBrowser();
  const logs = assignment.logs ?? [];
  if (logs.length === 0) return null;
  const logHref = `/orders/${assignment.id}/log`;

  return (
    <section className={`${boardingCardClass} px-5 pt-[18px] pb-4`}>
      <h3 className="text-[16px] font-bold leading-normal text-[#4d5257]">每日相片日誌</h3>
      <div className="divide-y divide-[#c6ccd2]">
        {logs.map((entry) => {
          const media = entry.media ?? [];
          const sources = media.map((m) => m.src);
          return (
            <div key={entry.dateLabel} className="flex flex-col gap-[10px] pt-3 pb-3 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14px] font-bold leading-5 text-[#4d5257]">{entry.dateLabel}</p>
                {entry.badge ? <LogBadge tone={entry.pending ? "pending" : "done"}>{entry.badge}</LogBadge> : null}
              </div>
              {entry.pending ? (
                <button
                  type="button"
                  onClick={() => navigate(logHref)}
                  className="flex size-[72px] flex-col items-center justify-center gap-[5px] rounded-[8px] border border-[#c6ccd2] bg-white text-[12px] leading-normal text-[#797979] active:bg-[#f2f4f6] focus-visible:outline-2 focus-visible:outline-[#0091b2]"
                >
                  <img src="/icons/camera_grey.svg" alt="" aria-hidden className="size-4 object-contain" />
                  影相
                </button>
              ) : null}
              {media.length ? (
                <div className="flex gap-2">
                  {media.map((item, index) => (
                    <button
                      key={`${item.src}-${index}`}
                      type="button"
                      onClick={() => open(sources, index)}
                      aria-label={item.type === "video" ? "播放影片" : `查看相片 ${index + 1}`}
                      className={`relative flex size-[72px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[8px] active:opacity-90 ${item.type === "video" ? "bg-[#4d5257] text-white" : "bg-[#e6e9ee]"
                        }`}
                    >
                      {item.type === "video" ? (
                        <>
                          <i className="f7-icons text-[16px] leading-none" aria-hidden>
                            play_fill
                          </i>
                          {item.duration ? (
                            <span className="mt-1 text-[12px] leading-normal">{item.duration}</span>
                          ) : null}
                        </>
                      ) : (
                        <img src={item.src} alt="" className="size-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              ) : null}
              {entry.body ? <p className="text-[14px] leading-5 text-[#797979]">{entry.body}</p> : null}
              {entry.footer ? <p className="text-[12px] leading-normal text-[#797979]">{entry.footer}</p> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function BoardingDetail({ assignment }) {
  const rows = assignment.detailRows ?? [];
  const fee = assignment.fee;
  const boarding = assignment.status === "in_progress";
  const logPending = boarding && (assignment.logs ?? []).some((entry) => entry.pending);
  const logHref = `/orders/${assignment.id}/log`;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const notice = getBoardingNotice(searchParams.get("notice"));

  function closeNotice() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("notice");
    const qs = params.toString();
    navigate(qs ? `${pathname}?${qs}` : pathname, "replace");
  }

  function openNotice(type) {
    navigate(`${pathname}?notice=${type}`, "replace");
  }

  return (
    <div className="flex flex-col gap-5 px-[15px] pt-5 pb-5">
      <section className="flex items-start gap-3">
        <HeaderIcon kind="boarding" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="text-[16px] font-bold leading-normal text-[#4d5257]">
            {assignment.title} · {assignment.code}
          </h2>
          {assignment.headerSchedule || assignment.headerPetLine ? (
            <p className="text-[12px] leading-normal text-[#797979]">
              {assignment.headerSchedule}
              {assignment.headerPetLine ? (
                <>
                  <br />
                  {assignment.headerPetLine}
                </>
              ) : null}
            </p>
          ) : null}
        </div>
        {boarding && assignment.badge ? (
          <span className="inline-flex h-5 shrink-0 items-center whitespace-nowrap rounded-full bg-[#ffdcdb] px-3 text-[12px] font-medium leading-5 tracking-[0.3px] text-[#d95959]">
            {assignment.badge}
          </span>
        ) : null}
      </section>

      {logPending ? (
        <section className="flex flex-col gap-5 rounded-[8px] bg-[#ffdcdb] px-5 py-[15px]">
          <div className="flex gap-[10px]">
            <img src="/icons/info_red.svg" alt="" aria-hidden className="size-4 shrink-0 object-contain" />
            <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
              <p className="text-[14px] font-bold leading-5 text-[#d95959]">今日日誌未更新</p>
              <p className="text-[14px] leading-5 text-[#d95959]">
                請於今晚 22:00 前上載最少 1 張相片及留言，客人會即時收到
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(logHref)}
            className="inline-flex h-[44px] w-full items-center justify-center rounded-[8px] bg-[#d95959] text-[14px] font-bold leading-5 text-white transition active:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d95959]"
          >
            更新日誌
          </button>
        </section>
      ) : null}

      {boarding ? <DailyPhotoLog assignment={assignment} /> : null}

      {boarding ? (
        <section className="flex flex-col gap-[10px]">
          <h3 className="text-[16px] font-bold leading-normal text-[#4d5257]">寄宿安排</h3>
          <div className="grid grid-cols-3 gap-[10px]">
            {boardingPlanTiles(assignment).map((tile) => (
              <button
                type="button"
                key={tile.label}
                aria-label={tile.label}
                onClick={() => openNotice(tile.notice)}
                className={`${boardingCardClass} flex cursor-pointer flex-col items-center gap-1 pt-3 pb-3 text-center transition active:bg-[#f5f6f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
              >
                <img src={tile.icon} alt="" aria-hidden className="size-[50px] object-contain" />
                <p className="text-[14px] font-bold leading-5 text-[#4d5257]">{tile.label}</p>
                <p className={`whitespace-nowrap text-[12px] leading-normal ${tile.subClass}`}>{tile.sub}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {rows.length ? (
        <section className={`${boardingCardClass} divide-y divide-[#c6ccd2] p-5`}>
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-[6px] py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2">
                <img
                  src={iconSrc[boardingRowIcon[row.icon] ?? "order-add-ons"]}
                  alt=""
                  aria-hidden
                  className="size-4 shrink-0 object-contain"
                />
                <p className="text-[14px] font-bold leading-5 text-[#4d5257]">{row.label}</p>
              </div>
              <p className="pl-6 text-[14px] leading-5 text-[#797979]">{row.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      {fee ? (
        <section className={`${boardingCardClass} p-5`}>
          <div className="flex items-start justify-between gap-3 text-[14px] leading-5">
            <span className="text-[#797979]">{fee.orderTotalLabel ?? "訂單總額"}</span>
            <span className="shrink-0 text-[#4d5257]">{money(fee.orderTotal)}</span>
          </div>
          {fee.showPlatformFee ? (
            <div className="mt-2 flex items-center justify-between text-[14px] leading-5">
              <span className="text-[#797979]">平台服務費 20%</span>
              <span className="text-[#4d5257]">- {money(fee.platformFee)}</span>
            </div>
          ) : null}
          <div className="my-3 h-px bg-[#c6ccd2]" />
          <div className="flex items-center justify-between gap-3">
            <span className="text-[14px] leading-5 text-[#797979]">{fee.incomeLabel ?? "你的收入"}</span>
            <span className="text-[18px] font-bold leading-normal text-[#0091b2]">{money(fee.income)}</span>
          </div>
          {fee.payoutNote ? (
            <p className="mt-3 text-right text-[12px] leading-normal text-[#797979]">{fee.payoutNote}</p>
          ) : null}
        </section>
      ) : null}

      <ContactFooter
        assignment={assignment}
        wrapperClassName=""
        buttonClassName="inline-flex h-[48px] w-full items-center justify-center rounded-[8px] border border-[#0091b2] bg-white px-4 text-[16px] font-bold text-[#0091b2] transition active:bg-brand-outline-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      />
      {notice ? (
        <BoardingNoticeSheet
          notice={notice}
          onClose={closeNotice}
          orderId={assignment.id}
          phoneNumber={assignment.contactPhone}
        />
      ) : null}
    </div>
  );
}

function RepairDetail({ assignment }) {
  const [detailsOpen, setDetailsOpen] = useState(true);
  const detail = repairDetailFromAssignment(assignment);

  return (
    <div className="space-y-4 px-[15px] py-4">
      <section className="flex gap-3 px-1">
        <HeaderIcon kind="repair" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-[15px] font-medium text-[#4d5257]">
              {assignment.title} · {assignment.code}
            </h2>
            <button
              type="button"
              aria-expanded={detailsOpen}
              aria-label={detailsOpen ? "收起訂單詳情" : "展開訂單詳情"}
              onClick={() => setDetailsOpen((open) => !open)}
              className="shrink-0 text-chevron"
            >
              <i
                className={`f7-icons size-5 ${chevronMotion} ${detailsOpen ? "" : " -rotate-180"}`}
                aria-hidden
              >
                chevron_down
              </i>
            </button>
          </div>
          {detail.metaLines.map((line) => (
            <p key={line} className="mt-1 text-[13px] leading-5 text-[#797979]">
              {line}
            </p>
          ))}
        </div>
      </section>

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
              <span className="text-[15px] font-medium text-[#4d5257]">
                訂單詳情
              </span>
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
            <div className="divide-y divide-[#eef0f3]">
              <div className="py-3 first:pt-0">
                <div className="flex gap-3">
                  <img
                    src={iconSrc["budget"]}
                    alt=""
                    aria-hidden
                    className="mt-1 size-4 shrink-0 object-contain"
                  />
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#4d5257]">
                      你的報價
                    </p>
                    <p className="text-[14px] leading-6">
                      <span className="font-bold text-[#0091b2]">
                        {detail.quoteMain}
                      </span>
                      <span className="text-[#797979]">
                        {" "}
                        · {detail.quoteBudget}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="py-3">
                <InfoRow
                  icon="clock"
                  label="指定服務日期"
                  value={detail.schedule}
                />
              </div>
              <div className="py-3">
                <InfoRow icon="pin" label="地區" value={detail.area} />
              </div>
              <div className="py-3 last:pb-0">
                <InfoRow
                  icon="plus"
                  label="維修詳情"
                  value={detail.repairDetailText}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactFooter
        assignment={assignment}
      />
    </div>
  );
}

function DefaultDetail({ assignment }) {
  return (
    <div className="space-y-4 px-[15px] py-4">
      <section className="flex items-start gap-3">
        <HeaderIcon kind={assignment.kind} />
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-bold leading-snug text-[#4d5257]">
            {assignment.title} · {assignment.code}
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-[#797979]">
            {assignment.subtitle}
          </p>
        </div>
      </section>

      <section className={`${orderDetailCardClass} divide-y divide-[#eef0f3]`}>
        {assignment.petProfile ? (
          <div className="py-3 first:pt-0">
            <InfoRow
              icon="pet"
              label="寵物資料"
              value={assignment.petProfile}
            />
          </div>
        ) : null}
        <div className="py-3">
          <InfoRow
            icon="clock"
            label={assignment.scheduleLabel}
            value={assignment.schedule}
          />
        </div>
        <div className="py-3">
          <InfoRow
            icon="pin"
            label={assignment.placeLabel}
            value={assignment.place}
          />
        </div>
        <div className="py-3 last:pb-0">
          <InfoRow
            icon="pay"
            label="服務酬勞"
            value={`${assignment.payMain} · ${assignment.payNote}`}
          />
        </div>
      </section>

      <ContactFooter
        assignment={assignment}
      />
    </div>
  );
}

export default function MyOrderDetail({ id }) {
  const { apply: applyService } = useOrderServiceLive();
  const raw = id ? getAssignment(id) : undefined;
  const assignment = raw ? applyService(raw) : undefined;
  const needsRegistration = useNeedsRegistration();

  if (needsRegistration) {
    return (
      <div className="px-5 py-4">
        <RegisterDataPrompt afterRegistered="即可查看訂單。" />
      </div>
    );
  }

  if (!assignment || assignment.status === "done") {
    return <p className="px-4 py-8 text-sm text-[#797979]">找不到這張訂單。</p>;
  }

  const layout = resolveMyOrderDetailLayout(assignment);

  if (layout === "walkPackage") {
    return (
      <WalkPackageDetail
        assignment={assignment}
      />
    );
  }
  if (layout === "boarding") {
    return (
      <BoardingDetail
        assignment={assignment}
      />
    );
  }
  if (layout === "repair") {
    return (
      <RepairDetail
        assignment={assignment}
      />
    );
  }
  return <DefaultDetail assignment={assignment} />;
}
