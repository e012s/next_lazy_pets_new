"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { iconSrc } from "@/icons/sources";
import { navigate } from "@/lib/navigation";
import { money } from "@/lib/format";
import { RegisteredData } from "@/components/RegisteredData";
import { completedCardClass } from "@/components/orders/CompletedDetailSections";
import {
  featuredIncomeRecords,
  historyMonths,
  INCOME_STATEMENT_SAMPLE_PDF,
  incomeSummary,
  INCOME_TABS,
  HISTORY_FILTERS,
  normalizeHistoryFilter,
} from "@/service/mock/income";
import {
  formatWalletRecentMeta,
  formatWalletRecentTitle,
  wallet,
  walletQuoteEstimate,
  walletRecentUsage,
} from "@/service/mock/wallet";

const ICON_KEY = {
  groom: "pet-groom",
  boarding: "pet-boarding",
  visit: "pet-walk",
  walk: "pet-walk",
};
const donePillClass =
  "mt-1 inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-full border border-[#c6ccd2] bg-white px-[10px] text-[12px] font-medium leading-[17px] tracking-[0.3px] text-[#797979]";
const pendingPillClass =
  "mt-1 inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-full bg-[#ffdcdb] px-[10px] text-[12px] font-medium leading-[17px] tracking-[0.3px] text-[#d95959]";

function incomeTabFromPath(pathname) {
  const segment = pathname.split("/").filter(Boolean).at(-1);
  if (segment === "wallet") return "wallet";
  if (segment === "history") return "history";
  return "income";
}

function downloadIncomeStatement(monthId) {
  const link = document.createElement("a");
  link.href = INCOME_STATEMENT_SAMPLE_PDF;
  link.download = `lazy-pets-statement-${monthId}.pdf`;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function incomeTabPath(tab, filter) {
  if (tab === "wallet") return "/income/wallet";
  if (tab === "history") {
    const resolved = normalizeHistoryFilter(filter);
    if (resolved === "all") return "/income/history";
    const params = new URLSearchParams();
    params.set("filter", resolved);
    return `/income/history?${params.toString()}`;
  }
  return "/income";
}

function InfoBanner({ children }) {
  return (
    <p className="flex gap-2 rounded-xl bg-brand-soft px-3.5 py-3 text-[13px] leading-5 text-brand">
      <img
        src={iconSrc["info"]}
        alt=""
        aria-hidden
        className="mt-0.5 size-4 shrink-0 object-contain"
      />
      <span>{children}</span>
    </p>
  );
}

function TextLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto flex items-center justify-center gap-0.5 pt-1 text-[14px] font-bold text-[#0091b2]"
    >
      {children}
      <i className="f7-icons size-3 ml-0.5 shrink-0 !font-bold text-current" aria-hidden>
        chevron_right
      </i>
    </button>
  );
}

function ServiceIcon({ icon }) {
  return (
    <img
      src={iconSrc[ICON_KEY[icon] ?? "pet-walk"]}
      alt=""
      aria-hidden
      className="size-12 shrink-0 object-contain"
    />
  );
}

function WalletRowIcon({ row }) {
  if (row.kind === "topup" || row.kind === "reward") {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ccf5ff]">
        <img src={iconSrc["plus"]} alt="" aria-hidden className="size-4 object-contain" />
      </span>
    );
  }
  return (
    <img
      src={iconSrc["repair-ac"]}
      alt=""
      aria-hidden
      className="size-10 shrink-0 object-contain"
    />
  );
}

function HistoryRowIcon({ icon }) {
  if (icon === "doc") {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f4f6f7]">
        <img src={iconSrc["income-doc"]} alt="" aria-hidden className="size-5 object-contain" />
      </span>
    );
  }
  if (icon === "topup") {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ccf5ff]">
        <img src={iconSrc["plus"]} alt="" aria-hidden className="size-4 object-contain" />
      </span>
    );
  }
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ccf5ff]">
      <img
        src="/icons/bottom-menu/income_blue.svg"
        alt=""
        aria-hidden
        className="size-5 object-contain"
      />
    </span>
  );
}

function Amount({ value, pending = false }) {
  const positive = value > 0;
  const className = pending
    ? "text-sm font-bold text-[#4d5257]"
    : positive
      ? "text-sm font-bold text-[#0091b2]"
      : "text-sm font-bold text-[#4d5257]";
  const label = pending || !positive ? money(value) : `+${money(value)}`;
  return <span className={className}>{label}</span>;
}

function EarningsTab({ onOpenHistory }) {
  const rows = featuredIncomeRecords();
  return (
    <div className="flex flex-col gap-3 px-[15px] pt-5 pb-[30px]">
      <section className="rounded-2xl bg-[#0091b2] px-5 py-5 text-white">
        <p className="text-sm text-white/80">{incomeSummary.monthLabel}</p>
        <p className="mt-2 text-[40px] leading-none font-bold">{money(incomeSummary.payout)}</p>
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/20 pt-4 text-center">
          <div>
            <p className="text-[12px] text-white/75">已完成</p>
            <p className="mt-1 text-lg font-medium">{incomeSummary.doneCount} 單</p>
          </div>
          <div>
            <p className="text-[12px] text-white/75">待完成</p>
            <p className="mt-1 text-lg font-medium">{money(incomeSummary.pending)}</p>
          </div>
          <div>
            <p className="text-[12px] text-white/75">今年累計</p>
            <p className="mt-1 text-lg font-medium">{money(incomeSummary.yearTotal)}</p>
          </div>
        </div>
      </section>
      <InfoBanner>{incomeSummary.notice}</InfoBanner>
      <section className={`${completedCardClass} p-5`}>
        <h2 className="text-[15px] font-bold text-[#4d5257]">10月明細</h2>
        <p className="mt-1 text-[12px] text-[#797979]">點擊開啟訂單詳情及報告</p>
        <RegisteredData afterRegistered="即可查看收入明細。">
          <ul className="mt-1">
            {rows.map((record, index) => (
              <li key={record.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/income/${record.id}`)}
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <ServiceIcon icon={record.icon} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-[#4d5257]">
                      {record.title}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-[#797979]">{record.meta}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end text-right">
                    <Amount value={record.payout} pending={record.status === "pending"} />
                    <span className={record.status === "pending" ? pendingPillClass : donePillClass}>
                      {record.status === "pending" ? "待完成" : "已完成"}
                    </span>
                  </span>
                </button>
                {index < rows.length - 1 ? (
                  <div className="ml-[60px] border-b border-[#eef1f4]" aria-hidden />
                ) : null}
              </li>
            ))}
          </ul>
          <TextLink onClick={onOpenHistory}>查看過去紀錄</TextLink>
        </RegisteredData>
      </section>
    </div>
  );
}

function WalletTab({ onOpenWalletHistory }) {
  const quoteTimes = walletQuoteEstimate(wallet.balance, wallet.quoteFee);
  const rows = walletRecentUsage(3);
  return (
    <div className="flex flex-col gap-3 px-[15px] pt-5 pb-[30px]">
      <section className="rounded-2xl bg-[#0091b2] px-5 py-5 text-white">
        <p className="text-sm text-white/80">儲值金餘額</p>
        <p className="mt-2 text-[40px] leading-none font-bold">{money(wallet.balance)}</p>
        <p className="mt-3 text-sm text-white/85">
          約可報價 {quoteTimes} 次（每次 {money(wallet.quoteFee)}）
        </p>
        <button
          type="button"
          onClick={() => navigate("/balance")}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-1 rounded-[8px] bg-white text-[15px] font-bold text-[#0091b2] transition active:opacity-90"
        >
          <i className="f7-icons size-5 font-bold text-[#0091b2]" aria-hidden>plus</i>
          增值
        </button>
      </section>
      <InfoBanner>
        維修報價每次 {money(wallet.quoteFee)}，客人檢閱報價後才會扣除。寵物任務接單不扣儲值金。
      </InfoBanner>
      <section className={`${completedCardClass} p-5`}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[15px] font-bold text-[#4d5257]">最近使用</h2>
          <span className="text-[12px] text-[#797979]">10月</span>
        </div>
        <RegisteredData afterRegistered="即可查看儲值金紀錄。">
          <ul className="mt-1">
            {rows.map((row, index) => (
              <li key={row.id}>
                <div className="flex items-center gap-3 py-3">
                  <WalletRowIcon row={row} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-[#4d5257]">
                      {formatWalletRecentTitle(row)}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-4 text-[#797979]">
                      {formatWalletRecentMeta(row)}
                    </span>
                  </span>
                  <Amount value={row.amount} />
                </div>
                {index < rows.length - 1 ? (
                  <div className="ml-[52px] border-b border-[#eef1f4]" aria-hidden />
                ) : null}
              </li>
            ))}
          </ul>
          <TextLink onClick={onOpenWalletHistory}>查看全部儲值金紀錄</TextLink>
        </RegisteredData>
      </section>
    </div>
  );
}

function HistoryTab({ filter, onFilterChange }) {
  const months = historyMonths
    .map((month) => ({
      ...month,
      rows:
        filter === "all" ? month.rows : month.rows.filter((row) => row.kind === filter),
    }))
    .filter((month) => month.rows.length > 0);

  return (
    <div className="flex flex-col gap-3 px-[15px] pt-5 pb-[30px]">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="紀錄類型">
        {HISTORY_FILTERS.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onFilterChange(item.id)}
              className={
                active
                  ? "inline-flex h-8 items-center rounded-full bg-[#0091b2] px-4 text-[13px] font-bold text-white"
                  : "inline-flex h-8 items-center rounded-full border border-[#c6ccd2] bg-white px-4 text-[13px] font-medium text-[#4d5257]"
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <RegisteredData afterRegistered="即可查看過去紀錄。">
        {months.length === 0 ? (
          <p className={`${completedCardClass} px-4 py-10 text-center text-sm text-[#797979]`}>
            這個分類未有紀錄
          </p>
        ) : (
          <div className="flex flex-col gap-3">
          {months.map((month) => (
            <section key={month.id} className={`${completedCardClass} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-bold text-[#4d5257]">{month.title}</h2>
                  <p className="mt-1 text-[12px] text-[#797979]">{month.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadIncomeStatement(month.id)}
                  className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-[13px] font-medium text-[#0091b2]"
                >
                  <img
                    src={iconSrc["income-download"]}
                    alt=""
                    aria-hidden
                    className="size-4 shrink-0 object-contain"
                  />
                  月結單
                </button>
              </div>
              <ul className="mt-1">
                {month.rows.map((row, index) => (
                  <li key={row.id}>
                    <div className="flex items-center gap-3 py-3">
                      <HistoryRowIcon icon={row.icon} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-[#4d5257]">{row.title}</span>
                        <span className="mt-0.5 block text-[12px] text-[#797979]">{row.meta}</span>
                      </span>
                      <Amount value={row.amount} />
                    </div>
                    {index < month.rows.length - 1 ? (
                      <div className="ml-[52px] border-b border-[#eef1f4]" aria-hidden />
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          </div>
        )}
      </RegisteredData>
    </div>
  );
}

export function IncomeTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = incomeTabFromPath(pathname);
  const filter = normalizeHistoryFilter(searchParams.get("filter"));

  function go(nextTab, nextFilter = filter) {
    const resolvedFilter =
      nextTab === "history" ? normalizeHistoryFilter(nextFilter) : "all";
    router.replace(incomeTabPath(nextTab, resolvedFilter), { scroll: false });
  }

  return (
    <div
      className="grid h-[46px] w-full grid-cols-3 bg-[#4d5257] text-[14px]"
      role="tablist"
      aria-label="收入分類"
    >
      {INCOME_TABS.map((item) => {
        const active = tab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => go(item.id, item.id === "history" ? filter : "all")}
            className={`h-full${active ? " font-bold text-white shadow-[inset_0_-3px_0_#28c6ed]" : " font-normal text-[#b9b9b9]"}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default function Income() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = incomeTabFromPath(pathname);
  const filter = normalizeHistoryFilter(searchParams.get("filter"));

  function go(nextTab, nextFilter = filter) {
    const resolvedFilter = nextTab === "history" ? normalizeHistoryFilter(nextFilter) : "all";
    router.replace(incomeTabPath(nextTab, resolvedFilter), { scroll: false });
  }

  return (
    <div>
      {tab === "wallet" ? (
        <WalletTab onOpenWalletHistory={() => go("history", "wallet")} />
      ) : tab === "history" ? (
        <HistoryTab filter={filter} onFilterChange={(next) => go("history", next)} />
      ) : (
        <EarningsTab onOpenHistory={() => go("history", "all")} />
      )}
    </div>
  );
}
