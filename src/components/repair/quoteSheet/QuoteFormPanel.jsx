import { iconSrc } from "@/icons/sources";
import { ApplyPill } from "@/components/apply/applyUi";
import { QuoteVisitTimeField } from "@/components/repair/QuoteVisitTimeField";
import { orderDetailCardClass } from "@/components/OrderBlocks";
import { formatAmountInput, money } from "@/lib/format";
import { btnPrimary } from "./styles";

const amountFieldShell =
  "mt-2 flex items-center gap-2 rounded-xl border-2 border-brand bg-white px-4 py-3";
const amountFieldInput =
  "min-w-0 flex-1 border-0 bg-transparent text-display font-bold text-foreground outline-none";

function QuoteAmountField({ label, value, onChange, className }) {
  return (
    <label className={className ?? "mt-4 block"}>
      <span className="text-[14px] font-bold text-[#4d5257]">{label}</span>
      <div className={amountFieldShell}>
        <span className="text-display font-bold text-foreground">$</span>
        <input
          className={amountFieldInput}
          inputMode="numeric"
          value={value}
          onChange={onChange}
        />
      </div>
    </label>
  );
}

export function QuoteFormPanel({
  job,
  balance,
  form,
  error,
  formScrollRef,
  onPatch,
  onVisitStartChange,
  onSubmit,
}) {
  const { mode, price, low, high, when, visitDate, visitStart, visitEnd, note } = form;

  return (
    <>
      <div ref={formScrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 pb-3">
        <section className={`${orderDetailCardClass} shadow-none`}>
          <div className="flex gap-3">
            <img src={iconSrc["repair-ac"]} alt="" aria-hidden className="inline-block object-contain size-12 shrink-0" />
            <div className="min-w-0 text-[13px] leading-5 text-[#797979]">
              <p className="text-[15px] font-medium text-[#4d5257]">
                {job.title} • #{job.id}
              </p>
              <p className="mt-1">
                {job.area.replace(/（.*$/, "")} • 客人預算 {job.budgetLabel}
              </p>
              <p className="mt-0.5">{job.schedule}</p>
            </div>
          </div>
        </section>

        <fieldset className="mt-5">
          <legend className="text-[14px] font-bold text-[#4d5257]">報價方式</legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <ApplyPill active={mode === "fixed"} onClick={() => onPatch({ mode: "fixed" })}>
              固定價
            </ApplyPill>
            <ApplyPill active={mode === "range"} onClick={() => onPatch({ mode: "range" })}>
              價錢範圍
            </ApplyPill>
          </div>
        </fieldset>

        {mode === "fixed" ? (
          <>
            <QuoteAmountField
              label="你的報價"
              value={price}
              onChange={(event) => onPatch({ price: formatAmountInput(event.target.value) })}
            />
            <span className="mt-2 block text-[12px] leading-[18px] text-[#797979]">{job.includes}</span>
          </>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <QuoteAmountField
                className="block"
                label="下限"
                value={low}
                onChange={(e) => onPatch({ low: formatAmountInput(e.target.value) })}
              />
              <QuoteAmountField
                className="block"
                label="上限"
                value={high}
                onChange={(e) => onPatch({ high: formatAmountInput(e.target.value) })}
              />
            </div>
            <span className="mt-2 block text-[12px] leading-[18px] text-[#797979]">{job.includes}</span>
          </>
        )}

        <fieldset className="mt-5">
          <legend className="text-[14px] font-bold text-[#4d5257]">可上門時間</legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <ApplyPill active={when === "guest"} onClick={() => onPatch({ when: "guest" })} className="px-3">
              跟客人指定時間
            </ApplyPill>
            <ApplyPill active={when === "other"} onClick={() => onPatch({ when: "other" })} className="px-3">
              建議其他時間
            </ApplyPill>
          </div>
          {when === "other" ? (
            <QuoteVisitTimeField
              date={visitDate}
              startTime={visitStart}
              endTime={visitEnd}
              onDateChange={(visitDate) => onPatch({ visitDate })}
              onStartChange={onVisitStartChange}
              onEndChange={(visitEnd) => onPatch({ visitEnd })}
            />
          ) : (
            <p className="mt-2 text-[12px] leading-[18px] text-[#797979]">{job.schedule}</p>
          )}
        </fieldset>

        <label className="mt-4 block">
          <span className="text-[14px] font-bold text-[#4d5257]">
            給客人的留言 <span className="font-normal text-[#797979]">（可選）</span>
          </span>
          <textarea
            value={note}
            rows={3}
            onChange={(event) => onPatch({ note: event.target.value })}
            placeholder="例如：舊機可即日帶走，需先確認牆身位置"
            className="mt-2 w-full resize-none rounded-xl border border-[#c6ccd2] px-3 py-2.5 text-[14px] leading-5 outline-none placeholder:text-[#b9b9b9] focus-visible:border-brand"
          />
        </label>
      </div>

      <div className="shrink-0 border-t border-[#eef0f3] px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {error ? (
          <p
            role="alert"
            className="mb-3 rounded-lg border border-[#f5d0d0] bg-[#fff5f5] px-3 py-2.5 text-[13px] leading-5 text-[#d95959]"
          >
            {error}
          </p>
        ) : null}
        <div className="flex gap-2 rounded-lg bg-brand-soft px-3 py-2.5 text-[12px] leading-[18px] text-brand">
          <img src={iconSrc["info"]} alt="" aria-hidden className="inline-block object-contain mt-0.5 size-4 shrink-0" />
          <p>
            報價費 {money(job.quoteFee)}，客人檢閱報價後先扣報價費。現時餘額 {money(balance)}。
          </p>
        </div>
        <button type="button" className={`${btnPrimary} mt-3`} onClick={onSubmit}>
          提交報價
          <i className="f7-icons size-4" aria-hidden>chevron_right</i>
        </button>
      </div>
    </>
  );
}
