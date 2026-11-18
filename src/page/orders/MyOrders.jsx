"use client";
import { iconSrc } from "@/icons/sources";
import { navigate } from "@/lib/navigation";
import { useEffect, useMemo } from "react";
import { listMyOrders } from "@/service/mock/assignments";
import { ContactGuestLink } from "@/components/ContactGuestLink";
import { RegisteredData } from "@/components/RegisteredData";
import { CompletedOrderFilters } from "@/components/orders/CompletedOrderFilters";
import { ReviewStarRow } from "@/components/orders/ReviewStars";
import { resolveListReview } from "@/service/orders/review";
import { MY_ORDER_TABS, useMyOrdersTab } from "@/context/MyOrdersTabContext";
import { filterCompletedOrders, DONE_MONTH_FILTER_OPTIONS } from "@/service/orders/completedFilters";
import { useOrderServiceLive } from "@/hooks/useOrderServiceLive";
const tabs = MY_ORDER_TABS;
const badgeClass = {
  alert: "bg-[#ffdcdb] text-[#d95959]",
  brand: "bg-[#0091b2] text-white",
  muted: "bg-[#eef0f2] text-[#797979]",
  ok: "bg-[#e7f6ee] text-[#1f8a4d]",
};
const doneBadgeCompleted =
  "inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-full border border-[#c6ccd2] bg-white px-[10px] text-[12px] font-medium leading-[17px] tracking-[0.3px] text-[#797979]";
const doneBadgeEnded =
  "inline-flex h-5 shrink-0 items-center whitespace-nowrap rounded-full bg-[#eef0f2] px-3 text-[12px] font-medium leading-[17px] tracking-[0.3px] text-[#797979]";
const outlineBtn =
  "inline-flex h-[44px] w-full items-center justify-center rounded-[8px] border border-[#0091b2] bg-white px-4 text-center text-[16px] font-bold leading-[21px] text-[#0091b2] transition active:bg-brand-outline-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const doneTeal = "text-[#0091b2]";
const doneOutlineBtn =
  "inline-flex h-[44px] w-full items-center justify-center rounded-[8px] border border-[#0091b2] bg-white px-4 text-center text-[16px] font-bold leading-[21px] text-[#0091b2] transition active:bg-brand-outline-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
function KindIcon({ kind, iconKey }) {
  const repair = kind === "repair";
  const key =
    iconKey ??
    (repair ? "repair-ac" : kind === "groom" ? "pet-groom" : kind === "boarding" ? "pet-boarding" : "pet-walk");
  return (
    <img
      src={iconSrc[key]}
      alt=""
      aria-hidden
      className={`inline-block shrink-0 object-contain ${repair ? "size-[60px]" : "size-[50px]"}`}
    />
  );
}
function DoneReviewSection({ review }) {
  const stars = review?.stars ?? 0;
  const text = review?.text ?? "";
  return (
    <Section icon="order-star" label="客人評價">
      {stars ? (
        <p className="flex items-center gap-2 text-[14px] leading-[23px] text-[#797979]">
          <ReviewStarRow count={stars} labelled />
          {text ? <span className="min-w-0">「{text}」</span> : null}
        </p>
      ) : (
        <p className="text-[14px] leading-[23px] text-[#797979]">尚未評價</p>
      )}
    </Section>
  );
}
function orderSubtitleLine(order) {
  if (order.doneList?.subtitle) return order.doneList.subtitle;
  if (order.doneList?.reportsSent != null) {
    const unit = order.kind === "boarding" ? "日誌" : "報告";
    return `${order.doneList.reportsSent} 份${unit}已發送`;
  }
  return order.subtitle;
}

const sectionIconSize = {
  "order-clock": "size-[13px]",
  "order-location": "size-[15px]",
};

function Section({ icon, label, children }) {
  return (
    <div className="flex w-full flex-col gap-[6px] border-t border-[#c6ccd2] pt-[14px] pb-[15px]">
      <div className="flex items-center gap-2">
        <span className="flex size-4 shrink-0 items-center justify-center">
          <img
            src={iconSrc[icon]}
            alt=""
            aria-hidden
            className={`${sectionIconSize[icon] ?? "size-4"} object-contain`}
          />
        </span>
        <p className="whitespace-nowrap text-[14px] font-bold leading-normal text-[#4d5257]">{label}</p>
      </div>
      <div className="min-w-0 pl-6">{children}</div>
    </div>
  );
}
export function MyOrdersTabs() {
  const { tab, setTab } = useMyOrdersTab();
  const orders = listMyOrders();
  const todayCount = orders.filter((item) => item.tab === "today").length;

  return (
    <div
      className="grid h-[46px] w-full grid-cols-3 bg-[#4d5257] text-[14px]"
      role="tablist"
      aria-label="訂單分類"
    >
      {tabs.map((item) => {
        const active = tab === item.id;
        const label =
          item.id === "today" ? `${item.label} · ${todayCount}` : item.label;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setTab(item.id)}
            className={`h-full${active ? " font-bold text-white shadow-[inset_0_-3px_0_#28c6ed]" : " font-normal text-[#b9b9b9]"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function MyOrders() {
  const { tab, setTab, doneMonth, setDoneMonth, doneServiceFilter, setDoneServiceFilter } =
    useMyOrdersTab();
  const { apply: applyService, start: startService } = useOrderServiceLive();
  const orders = listMyOrders();
  const monthOptions = DONE_MONTH_FILTER_OPTIONS;

  useEffect(() => {
    if (doneMonth == null) {
      setDoneMonth(new Date().getMonth() + 1);
    }
  }, [doneMonth, setDoneMonth]);

  const activeDoneMonth = doneMonth ?? new Date().getMonth() + 1;
  const visible = useMemo(() => {
    const base =
      tab !== "done"
        ? orders.filter((item) => item.tab === tab)
        : filterCompletedOrders(orders, {
            month: activeDoneMonth,
            serviceId: doneServiceFilter,
          });
    return base.map((item) => applyService(item));
  }, [orders, tab, activeDoneMonth, doneServiceFilter, applyService]);
  return (
    <div className="flex flex-col gap-5 px-[15px] pt-5 pb-[30px]">
      <RegisteredData afterRegistered="即可查看訂單。">
        {tab === "done" ? (
          <CompletedOrderFilters
            month={activeDoneMonth}
            monthOptions={monthOptions}
            serviceId={doneServiceFilter}
            onMonthChange={setDoneMonth}
            onServiceChange={setDoneServiceFilter}
          />
        ) : null}
        {visible.length === 0 ? (<p className="rounded-[8px] border border-[#c6ccd2] bg-white px-4 py-10 text-center text-[14px] leading-normal text-[#797979]">這個分類未有訂單</p>) : (visible.map((order) => {
          const isDone = order.tab === "done";
          const done = order.doneList;
          const compactDone = Boolean(isDone && (done?.compact || order.badge === "已結束"));
          const payNote = isDone ? (done?.payNote ?? "") : (order.payNote ?? "");
          const payMain = (isDone && done?.payMain) || order.payMain;
          const payLabel = isDone && done?.payLabel ? done.payLabel : "服務酬勞";
          const scheduleLine = isDone && done?.scheduleLine ? done.scheduleLine : order.schedule;
          const scheduleLabel = isDone ? "服務日期" : order.scheduleLabel;
          const listReview = isDone ? resolveListReview(done) : null;
          const badgeCls = !isDone
            ? `inline-flex h-5 shrink-0 items-center whitespace-nowrap rounded-full px-3 text-[12px] font-medium leading-5 tracking-[0.3px] ${badgeClass[order.badgeTone] ?? badgeClass.muted}`
            : compactDone
              ? doneBadgeEnded
              : doneBadgeCompleted;

          return (<article key={order.id} className="flex w-full flex-col gap-[6px] rounded-[8px] border border-[#c6ccd2] bg-white p-5">
          <div className={`flex w-full items-start gap-[14px]${compactDone ? "" : " pb-[6px]"}`}>
            <KindIcon kind={order.kind} iconKey={order.listIcon} />
            {compactDone ? (
              <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                <h2 className="text-[16px] font-bold leading-6 text-[#4d5257]">{order.title} · {order.code}</h2>
                <p className="whitespace-pre-line text-[14px] font-normal leading-5 text-[#797979]">{orderSubtitleLine(order)}</p>
              </div>
            ) : (
              <button type="button" onClick={() => navigate(`/orders/${order.id}`)} className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                <h2 className="text-[16px] font-bold leading-6 text-[#4d5257]">{order.title} · {order.code}</h2>
                <p className="whitespace-pre-line text-[14px] font-normal leading-5 text-[#797979]">{orderSubtitleLine(order)}</p>
              </button>
            )}
            <span className={badgeCls}>
              {order.badge}
            </span>
          </div>
          {compactDone ? null : (
          <>
            <Section icon="budget" label={payLabel}>
              <p className="flex min-h-[29px] flex-wrap items-baseline">
                <span className={`text-[20px] font-bold leading-[29px] ${isDone ? doneTeal : "text-[#0091b2]"}`}>{payMain}</span>
                {payNote ? (
                  <span className="text-[14px] font-normal leading-[21px] text-[#797979]">{"\u3000·\u3000"}{payNote}</span>
                ) : null}
              </p>
            </Section>
            <Section icon="order-clock" label={scheduleLabel}>
              <p className="text-[14px] leading-[23px] text-[#797979]">{scheduleLine}</p>
            </Section>
            {isDone ? (
              <DoneReviewSection review={listReview} />
            ) : (
              <Section icon="order-location" label={order.placeLabel}>
                <p className="text-[14px] leading-normal text-[#797979]">{order.place}</p>
                <button
                  type="button"
                  onClick={() => navigate(`/orders/${order.id}/map`)}
                  className="mt-[10px] inline-flex h-10 items-center justify-center rounded-[8px] bg-[#0091b2] px-[18px] text-[14px] font-bold leading-normal text-white transition active:bg-brand-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  查看地圖
                </button>
              </Section>
            )}
          <div
            className={
              order.tab === "upcoming" || order.tab === "done"
                ? "w-full pt-[14px]"
                : "grid w-full grid-cols-2 gap-[14px] pt-[14px]"
            }
          >
            {order.tab === "upcoming" ? (
              <button
                type="button"
                onClick={() => navigate(`/orders/${order.id}`)}
                className={outlineBtn}
              >
                查看訂單詳情
              </button>
            ) : order.tab === "done" ? (
              <button
                type="button"
                onClick={() => navigate(`/orders/${order.id}`)}
                className={doneOutlineBtn}
              >
                查看訂單詳情及報告
              </button>
            ) : (
              <>
                <ContactGuestLink
                  orderId={order.id}
                  phoneNumber={order.contactPhone}
                  className={outlineBtn}
                />
                {order.kind === "boarding" ? (
                  <button type="button" onClick={() => navigate(`/orders/${order.id}`)} className={outlineBtn}>
                    更新日誌
                  </button>
                ) : order.status === "in_progress" ? (
                  <button type="button" onClick={() => navigate(`/orders/${order.id}/report`)} className={outlineBtn}>
                    提交報告
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startService(order.id)}
                    className={outlineBtn}
                  >
                    開始服務
                  </button>
                )}
              </>
            )}
          </div>
          </>
          )}
        </article>);
        }))}
      </RegisteredData>
    </div>
  );
}
