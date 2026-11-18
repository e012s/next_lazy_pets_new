"use client";
import { navigate } from "@/lib/navigation";

const TABS = [
  { id: "home", label: "主頁", href: "/", icon: "home" },
  { id: "find", label: "尋找任務", href: "/find", icon: "search" },
  { id: "orders", label: "我的訂單", href: "/orders", icon: "orders" },
  // No messages page yet — routes to orders (where chat lives per order).
  { id: "messages", label: "訊息", href: "", icon: "chat", badge: 3 },
  { id: "income", label: "我的收入", href: "/income", icon: "income" },
];

export function BottomNav({ active }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center" aria-label="主選單">
      <div className="grid w-full max-w-[500px] grid-cols-5 border-t border-[#e8ecef] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-3px_6px_rgba(16,40,48,0.06)]">
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <button key={t.id} type="button" onClick={() => navigate(t.href)}
              aria-current={on ? "page" : undefined}
              className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px]${on ? " font-medium text-brand" : " text-[#797979]"}`}>
              <span className="relative">
                <img src={`/icons/bottom-menu/${t.icon}${on ? "_blue" : ""}.svg`} alt="" aria-hidden className="inline-block size-6 object-contain" />
                {t.badge ? (
                  <span className="absolute -right-1.5 -top-1 inline-flex min-w-4 h-4 items-center justify-center rounded-full bg-[#d95959] px-1 text-[10px] font-medium leading-none text-white">{t.badge}</span>
                ) : null}
              </span>
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  ); 
}
