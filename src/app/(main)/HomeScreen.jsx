"use client";

import { useEffect, useMemo, useState } from "react";
import { Screen } from "@/components/Screen";
import { ContactGuestLink } from "@/components/ContactGuestLink";
import { useNeedsRegistration } from "@/components/RegisteredData";
import { iconSrc } from "@/icons/sources";
import { incomeSummary } from "@/service/mock/income";
import { wallet } from "@/service/mock/wallet";
import {
  homeExpert,
  homePending,
  homePendingTotal,
  homeUpcoming,
  homeUpcomingTotal,
} from "@/service/mock/home";
import { navigate } from "@/lib/navigation";
import { clearAuthStorage } from "@/lib/preferences";
import { primeSessionCache } from "@/context/SessionContext";
import { BottomNav } from "@/components/BottomNav";

const NEARBY_NEW_TASKS = 12;

function greetingForHour(hour) {
  if (hour < 12) return "早晨";
  if (hour < 18) return "午安";
  return "晚安";
}

function PendingIcon({ kind }) {
  const src =
    kind === "calendar"
      ? "/icons/order-detail/calendar_blue.svg"
      : kind === "log"
        ? "/icons/order-detail/doc_blue.svg"
        : "/icons/order-detail/chat_blue.svg"
  return (
    <img src={src} alt="" aria-hidden className="block size-5 object-contain" />
  );
}

function KindIcon({ kind }) {
  if (kind === "ac") {
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
        className="inline-block size-12 shrink-0 object-contain"
      />
    );
  }
  if (kind === "groom") {
    return (
      <img
        src={iconSrc["pet-groom"]}
        alt=""
        aria-hidden
        className="inline-block size-12 shrink-0 object-contain"
      />
    );
  }
  return (
    <img
      src={iconSrc["pet-walk"]}
      alt=""
      aria-hidden
      className="inline-block size-12 shrink-0 object-contain"
    />
  );
}

const badgeClass = {
  progress: "bg-[#e7f7fb] text-[#0091b2]",
  muted: "bg-[#eef0f2] text-[#797979]",
  alert: "bg-[#fdecee] text-[#d95959]",
  ok: "bg-[#e7f6ee] text-[#1f8a4d]",
};

function money(n) {
  return `$${Number(n).toLocaleString("en-US")}`;
}

function StatusCard({
  greeting,
  displayName,
  statusLine,
  accepting,
  onToggleAccepting,
  monthIncome,
  pending,
  balance,
}) {
  return (
    <section className="rounded-xl bg-brand p-4 text-white shadow-[0_6px_16px_rgba(0,145,178,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[14px] font-normal leading-5 text-white/90">
            {greeting}，{displayName}
          </h2>
          <p className="mt-1 text-[22px] font-bold leading-7 tracking-tight">{statusLine}</p>
        </div>
        <button
          type="button"
          onClick={onToggleAccepting}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-brand ring-1 ring-white/25"
          aria-pressed={accepting}
        >
          <span
            className={`size-2 rounded-full${accepting ? " bg-[#22c55e]" : " bg-[#ffb4b4]"}`}
          />
          {accepting ? "接單中" : "暫停接單"}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/20 pt-3">
        <div>
          <p className="text-[11px] text-white/75">本月收入</p>
          <p className="mt-0.5 text-[16px] font-semibold tracking-tight">{money(monthIncome)}</p>
        </div>
        <div>
          <p className="text-[11px] text-white/75">待完成</p>
          <p className="mt-0.5 text-[16px] font-semibold tracking-tight">{money(pending)}</p>
        </div>
        <div>
          <p className="text-[11px] text-white/75">儲值金</p>
          <p className="mt-0.5 text-[16px] font-semibold tracking-tight">{money(balance)}</p>
        </div>
      </div>
    </section>
  );
}

function EmptyUpcoming({ nearbyCount, onFindTasks }) {

  return (
    <section>
      <h3 className="mb-2 text-[15px] font-medium text-[#4d5257]">即將服務</h3>
      <div className="rounded-xl border border-[#e8ecef] bg-white px-5 py-8 text-center shadow-[0_8px_24px_rgba(77,82,87,0.04)]">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#e7f7fb]">
          <img
            src="/icons/order-detail/calendar_blue.svg"
            alt=""
            aria-hidden
            className="inline-block size-7 object-contain"
          />
        </div>
        <p className="mt-4 text-[15px] font-medium text-[#4d5257]">暫時未有即將嘅服務</p>
        <p className="mt-1 text-[13px] text-[#797979]">
          附近有 {nearbyCount} 個新任務等緊你接
        </p>
        <button
          type="button"
          onClick={onFindTasks}
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-title font-medium text-white transition active:bg-brand-active"
        >
          去尋找任務
        </button>
      </div>
    </section>
  );
}

function RegisterPromptSheet({ open, onRegister, onLogout }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-[#102028]/40" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-register-title"
        className="relative z-10 w-full max-w-[22rem] rounded-2xl bg-white p-5 shadow-xl"
      >
        <p className="text-xs text-[#797979]">專家註冊</p>
        <h2 id="home-register-title" className="mt-1 text-lg font-medium text-[#4d5257]">
          完成註冊後即可接單
        </h2>
        <p className="mt-2 text-sm leading-5 text-[#797979]">
          你已登入，但尚未完成專家註冊。完成後就可以查看訂單、接新任務同收取收入。
        </p>
        <button
          type="button"
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-title font-medium text-white transition active:bg-brand-active"
          onClick={onRegister}
        >
          去註冊
        </button>
        <button
          type="button"
          className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#dfe3e6] bg-white px-4 text-title font-medium text-[#4d5257] transition active:bg-[#f3f5f7]"
          onClick={onLogout}
        >
          登出
        </button>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const needsRegistration = useNeedsRegistration();
  const [accepting, setAccepting] = useState(homeExpert.acceptingOrders);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    if (!needsRegistration) return undefined;
    const id = window.setTimeout(() => setRegisterOpen(true), 350);
    return () => window.clearTimeout(id);
  }, [needsRegistration]);

  const greeting = useMemo(() => greetingForHour(new Date().getHours()), []);
  const nextShort = homeUpcoming[0]
    ? homeUpcoming[0].schedule.includes("今日")
      ? `今日 ${homeUpcoming[0].schedule.match(/\d{2}:\d{2}/)?.[0] ?? ""}`.trim()
      : homeUpcoming[0].schedule
    : "暫無";

  return (
    <Screen
      title="主頁"
      hideBack
      bottomNav={<BottomNav active="home" />}
    >
      <div className="space-y-5 px-[15px] pb-8 pt-4">
        {needsRegistration ? (
          <>
            <StatusCard
              greeting={greeting}
              displayName={homeExpert.displayName}
              statusLine="暫時未有服務"
              accepting={accepting}
              onToggleAccepting={() => setAccepting((v) => !v)}
              monthIncome={0}
              pending={0}
              balance={wallet.balance}
            />
            <EmptyUpcoming
              nearbyCount={NEARBY_NEW_TASKS}
              onFindTasks={() => navigate("/find")}
            />
          </>
        ) : (
          <>
            <StatusCard
              greeting={greeting}
              displayName={homeExpert.displayName}
              statusLine={`下一單：${nextShort}`}
              accepting={accepting}
              onToggleAccepting={() => setAccepting((v) => !v)}
              monthIncome={incomeSummary.payout}
              pending={incomeSummary.pending}
              balance={wallet.balance}
            />

            <section>
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <h3 className="text-[16px] font-bold text-[#4d5257]">
                  待處理 · {homePending.length}
                </h3>
                <button
                  type="button"
                  onClick={() => navigate("/orders")}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-brand"
                >
                  <span>全部 ({homePendingTotal})</span>
                  <i className="f7-icons size-4 shrink-0 font-bold" aria-hidden>
                    chevron_right
                  </i>
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#dfe3e6] bg-white">
                {homePending.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(`/orders/${item.orderId}`)}
                    className={`flex w-full items-center gap-3 px-3 py-3 text-left${index > 0 ? " border-t border-[#eef1f4]" : ""}`}
                  >
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#dff3f8]">
                      <PendingIcon kind={item.icon} />
                    </span>
                    <span className="min-w-0 flex-1 py-0.5">
                      <span className="block truncate text-[15px] font-bold leading-5 text-[#4d5257]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] leading-4 text-[#797979]">
                        {item.detail}
                      </span>
                    </span>
                    <span className="inline-flex w-8 shrink-0 items-center justify-end gap-1.5">
                      {item.unread ? (
                        <span className="size-2 rounded-full bg-[#d95959]" aria-hidden />
                      ) : (
                        <span className="size-2 shrink-0" aria-hidden />
                      )}
                      <img
                        src={iconSrc["chevron"]}
                        alt=""
                        aria-hidden
                        className="inline-block size-3.5 shrink-0 object-contain"
                      />
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <h3 className="text-[16px] font-bold text-[#4d5257]">即將服務</h3>
                <button
                  type="button"
                  onClick={() => navigate("/orders")}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-brand"
                >
                  <span>全部訂單 ({homeUpcomingTotal})</span>
                  <i className="f7-icons size-4 shrink-0 font-bold" aria-hidden>
                    chevron_right
                  </i>
                </button>
              </div>
              <div className="space-y-3">
                {homeUpcoming.map((order) => {
                  const live = order.status === "in_progress";
                  return (
                    <article
                      key={order.id}
                      className={`rounded-xl bg-white p-3.5${live ? " border-2 border-brand" : " border border-[#dfe3e6]"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-[15px] font-bold text-brand">
                          <img src={iconSrc["order-clock"]} alt="" aria-hidden className="inline-block size-4 object-contain" />
                          {order.schedule}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] font-medium${live
                            ? " bg-[#dff3f8] text-brand"
                            : " border border-[#C6CCD2] bg-white text-[#4d5257]"}`}
                        >
                          {order.badge}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <KindIcon kind={order.kind} />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[17px] font-bold leading-6 text-[#4d5257]">
                            {order.title}
                          </h4>
                          <p className="text-[12px] text-[#797979]">{order.subtitle}</p>
                        </div>
                      </div>
                      <p className="mt-3 flex items-center gap-1.5 border-t border-[#eef1f4] pt-3 text-[13px] text-[#4d5257]">
                        <img src={iconSrc["order-location"]} alt="" aria-hidden className="inline-block size-4 object-contain" />
                        <span className="truncate">{order.place}</span>
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <ContactGuestLink
                          orderId={order.orderId}
                          phoneNumber={order.contactPhone}
                          className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-brand bg-white px-3 text-[14px] font-medium text-brand transition active:bg-brand-outline-active"
                        />
                        <button
                          type="button"
                          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-brand px-3 text-[14px] font-medium text-white transition active:bg-brand-active"
                          onClick={() => navigate(`/orders/${order.orderId}`)}
                        >
                          {order.detailLabel}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>

      <RegisterPromptSheet
        open={needsRegistration && registerOpen}
        onRegister={() => {
          setRegisterOpen(false);
          navigate("/apply/role");
        }}
        onLogout={async () => {
          await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(
            () => {},
          );
          clearAuthStorage();
          primeSessionCache({ authenticated: false });
          setRegisterOpen(false);
          navigate("/login", "replace");
        }}
      />

    </Screen>
  );
}
