import { iconSrc } from "@/icons/sources";
export function ShellNotice({ children }) {
  return (
    <p className="flex gap-2 rounded-lg bg-brand-soft px-3.5 py-3 text-[13px] leading-5 font-normal text-brand">
      <img src={iconSrc["info"]} alt="" aria-hidden className="inline-block object-contain mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
