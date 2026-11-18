"use client";

import { useEffect, useRef } from "react";
import { iconSrc } from "@/icons/sources";

/**
 * @param {{
 *   ariaLabel: string;
 *   value: string | number;
 *   options: { id: string | number; label: string }[];
 *   onChange: (id: string | number) => void;
 *   open: boolean;
 *   onOpenChange: (open: boolean) => void;
 * }} props
 */
export function FilterDropdown({ ariaLabel, value, options, onChange, open, onOpenChange }) {
  const wrapRef = useRef(null);
  const selected = options.find((item) => item.id === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (wrapRef.current?.contains(target)) return;
      onOpenChange(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onOpenChange]);

  return (
    <div ref={wrapRef} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => onOpenChange(!open)}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-[8px] border border-[#c6ccd2] bg-white px-[15px] text-left text-[14px] font-normal leading-[21px] text-[#4d5257] transition-shadow${open ? " shadow-[0_0_0_1px_#0091b2]" : ""}`}
      >
        <span className="min-w-0 truncate">{selected?.label}</span>
        <img
          src={iconSrc["chevron-down"]}
          alt=""
          aria-hidden
          width={11}
          height={12}
          className={`h-3 w-[11px] shrink-0 object-contain object-center transition-transform motion-reduce:transition-none${open ? " -rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute top-[calc(100%+4px)] left-0 z-30 max-h-56 w-full overflow-y-auto rounded-[8px] border border-[#c6ccd2] bg-white py-1 shadow-[0_8px_24px_rgba(77,82,87,0.12)]"
        >
          {options.map((item) => {
            const active = item.id === value;
            return (
              <li key={String(item.id)} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[14px] transition-colors${active ? " bg-[#eef9fc] font-bold text-[#0091b2]" : " text-[#4d5257] active:bg-[#f5f6f7]"}`}
                  onClick={() => {
                    onChange(item.id);
                    onOpenChange(false);
                  }}
                >
                  <span className="min-w-0 truncate">{item.label}</span>
                  {active ? (
                    <img src={iconSrc.check} alt="" aria-hidden className="size-4 shrink-0 object-contain" />
                  ) : (
                    <span className="size-4 shrink-0" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
