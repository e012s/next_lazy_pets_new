import { iconSrc } from "@/icons/sources";
import { orderDetailCardClass } from "@/components/OrderBlocks";
import { money, parseAmountInput } from "@/lib/format";
import { btnPrimary } from "./styles";

function DetailRow({ iconSrc: src, label, value, withBorder = true }) {
  return (
    <div className={`py-3 first:pt-0${withBorder ? " border-b border-[#eef0f3] last:border-b-0 last:pb-0" : ""}`}>
      <div className="flex gap-3">
        <img src={src} alt="" aria-hidden className="mt-0.5 size-4 shrink-0 object-contain" />
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-[#4d5257]">{label}</p>
          <p className="mt-1 text-[14px] leading-6 text-muted">{value}</p>
        </div>
      </div>
    </div>
  );
}

function formatQuoteLabel(quote) {
  if (quote.mode === "fixed") {
    return money(parseAmountInput(quote.fixedPrice));
  }
  return `${money(parseAmountInput(quote.low))} – ${money(parseAmountInput(quote.high))}`;
}

export function QuoteSuccessPanel({ job, submittedQuote, onDone }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center text-center">
        <img src={iconSrc["accept-order"]} alt="" aria-hidden className="inline-block object-contain size-[72px] shrink-0 rounded-full" />
        <h2 id="repair-quote-submitted-title" className="mt-4 text-[22px] font-bold leading-8 text-[#4d5257]">
          報價已提交
        </h2>
        <p className="mt-2 text-[14px] leading-5 text-[#797979]">
          客人檢閱報價後，先扣報價費 {money(job.quoteFee)}。{job.quoteSubmittedNotice}
        </p>
        {submittedQuote ? (
          <section className={`${orderDetailCardClass} mt-6 w-full text-left shadow-none`}>
            <DetailRow iconSrc={iconSrc["budget"]} label="你的報價" value={formatQuoteLabel(submittedQuote)} />
            <DetailRow
              iconSrc={iconSrc["order-clock"]}
              label={submittedQuote.scheduleCaption}
              value={submittedQuote.schedule}
              withBorder={Boolean(submittedQuote.note)}
            />
            {submittedQuote.note ? (
              <DetailRow iconSrc={iconSrc["order-add-ons"]} label="給客人的留言" value={submittedQuote.note} withBorder={false} />
            ) : null}
          </section>
        ) : null}
        <button type="button" className={`${btnPrimary} mt-6 shrink-0`} onClick={onDone}>
          返回尋找任務
          <i className="f7-icons size-4" aria-hidden>chevron_right</i>
        </button>
      </div>
    </div>
  );
}
