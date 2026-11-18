export const findTaskCardClass =
  "overflow-hidden rounded-xl border border-[#c6ccd2] bg-white p-4";

export const findTaskOutlineBtn =
  "inline-flex h-11 w-full min-w-0 flex-1 items-center justify-center rounded-lg border border-brand bg-white px-4 text-field font-medium text-brand transition active:bg-[#f4fbfd] max-[375px]:flex-none";

export const findTaskPrimaryBtn =
  "inline-flex h-11 w-full min-w-0 flex-1 items-center justify-center rounded-lg bg-brand px-4 text-field font-medium text-white transition active:bg-[#007a96] max-[375px]:flex-none";

export const findTaskCardActionsClass =
  "mt-4 flex flex-row gap-3 max-[375px]:flex-col";

export const findTaskRowIconClass = "mt-0.5 size-5 shrink-0";

export const findTaskRowListClass =
  "mt-3 divide-y divide-[#eef0f3] border-t border-[#eef0f3]";

export const findTaskRowValueClass =
  "text-[14px] font-normal leading-5 text-muted";

export function FindTaskCardRow({ iconSrc: src, label, children, valueClassName }) {
  return (
    <li className="flex gap-3 py-3 first:pt-3 last:pb-0">
      <img src={src} alt="" aria-hidden className={`${findTaskRowIconClass} object-contain`} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-caption font-bold text-foreground">{label}</p>
        <div className={valueClassName ?? findTaskRowValueClass}>{children}</div>
      </div>
    </li>
  );
}