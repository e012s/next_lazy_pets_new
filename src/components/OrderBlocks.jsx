import { money } from "@/lib/format";
import { iconSrc } from "@/icons/sources";

export const orderDetailCardClass = "rounded-2xl border border-[#c6ccd2] bg-white p-4";

const iconMap = {
  pet: "animal",
  heart: "animal",
  health: "health",
  calendar: "order-clock",
  clock: "order-clock",
  pin: "order-location",
  plus: "order-add-ons",
  pay: "budget",
  ac: "repair-ac",
  vet: "order-doctor",
  phone: "order-contact",
};

export function InfoRow({ icon, label, value }) {
  const src = iconSrc[iconMap[icon]];
  return (
    <div className="flex gap-3">
      <img src={src} alt="" aria-hidden className="mt-1 size-4 shrink-0 object-contain" />
      <div className="min-w-0">
        <p className="text-[14px] font-bold">{label}</p>
        <p className="text-[14px] leading-6 text-muted">{value}</p>
      </div>
    </div>
  );
}

export function FeeCard({
  orderTotal,
  orderTotalLabel = "訂單總額",
  platformFee,
  showPlatformFee = platformFee != null,
  income,
  incomeLabel = "你的收入",
  incomeFormula,
  payoutNote,
}) {
  return (
    <section className={`${orderDetailCardClass} shadow-[0_8px_24px_rgba(77,82,87,0.05)]`}>
      <div className="flex items-start justify-between gap-3 text-sm">
        <span className="text-[#797979]">{orderTotalLabel}</span>
        <span className="shrink-0 text-[#4d5257]">{money(orderTotal)}</span>
      </div>
      {showPlatformFee ? (
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-[#797979]">平台服務費 20%</span>
          <span className="text-[#4d5257]">- {money(platformFee)}</span>
        </div>
      ) : null}
      <div className="my-3 h-px bg-[#eef0f3]" />
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-[#797979]">{incomeLabel}</p>
        <div className="min-w-0 text-right flex flex-col items-end gap-3">
          <p className="text-display font-bold leading-tight text-brand">
            {money(income)}
            {incomeFormula ? ` ${incomeFormula}` : null}
          </p>
          {payoutNote ? (
            <p className="text-caption font-normal leading-4 text-[#797979]">{payoutNote}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}