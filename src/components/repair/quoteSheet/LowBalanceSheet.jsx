import { money } from "@/lib/format";
import { QuoteDrawer } from "./QuoteDrawer";
import { btnMuted, btnPrimary } from "./styles";

export function LowBalanceSheet({
  open,
  quoteFee,
  balance,
  onOpenChange,
  onClose,
  onTopUp,
  onQuoteLater,
}) {
  return (
    <QuoteDrawer
      open={open}
      layer="lowBalance"
      labelledBy="low-balance-title"
      title="儲值金不足"
      closeLabel="關閉儲值金不足提示"
      onClose={onClose}
      onOpenChange={onOpenChange}
    >
      <div className="px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1">
        <div className="min-h-20 rounded-xl bg-[#ffdcdb] px-4 py-4 text-[14px] leading-5">
          <div className="flex justify-between gap-3">
            <span className="text-[#d95959]">報價費</span>
            <span className="font-medium text-[#d95959]">{money(quoteFee)}</span>
          </div>
          <div className="mt-2 flex justify-between gap-3">
            <span className="text-[#d95959]">你的餘額</span>
            <span className="font-bold text-[#d95959]">{money(balance)}</span>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-[#797979]">
          增值後會返回呢張報價，已填內容會保留。
        </p>
        <button type="button" className={`${btnPrimary} mt-4`} onClick={onTopUp}>
          + 立即增值
        </button>
        <button type="button" className={`${btnMuted} mt-2`} onClick={onQuoteLater}>
          稍後再報價
        </button>
      </div>
    </QuoteDrawer>
  );
}
