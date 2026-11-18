"use client";

import { useCallback, useEffect, useRef } from "react";

/** Compact defaults for mobile bottom sheets (3 visible rows). */
const DEFAULT_ITEM_HEIGHT = 32;
const DEFAULT_VISIBLE_ROWS = 3;

/**
 * @param {{
 *   options: string[];
 *   value: string;
 *   onChange: (value: string) => void;
 *   className?: string;
 *   "aria-label"?: string;
 *   itemHeight?: number;
 *   visibleRows?: number;
 * }} props
 */
export function ScrollWheelPicker({
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
  itemHeight = DEFAULT_ITEM_HEIGHT,
  visibleRows = DEFAULT_VISIBLE_ROWS,
}) {
  const listRef = useRef(null);
  const scrollEndTimer = useRef(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const paddingRows = Math.floor(visibleRows / 2);
  const panelHeight = itemHeight * visibleRows;

  const scrollToValue = useCallback(
    (nextValue, behavior = "auto") => {
      const list = listRef.current;
      if (!list) return;
      const index = options.indexOf(nextValue);
      if (index < 0) return;
      list.scrollTo({ top: index * itemHeight, behavior });
    },
    [options, itemHeight],
  );

  useEffect(() => {
    scrollToValue(value);
  }, [value, scrollToValue]);

  function syncFromScroll() {
    const list = listRef.current;
    if (!list || options.length === 0) return;
    const index = Math.round(list.scrollTop / itemHeight);
    const clamped = Math.max(0, Math.min(options.length - 1, index));
    const next = options[clamped];
    if (next !== valueRef.current) onChange(next);
  }

  function handleScroll() {
    if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = window.setTimeout(syncFromScroll, 80);
    syncFromScroll();
  }

  return (
    <div
      className={`relative isolate min-w-0 flex-1 overflow-hidden bg-white${className}`}
      style={{ height: panelHeight }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 rounded-md border border-[#0091b2]/25 bg-[#e7f7fb]"
        style={{ height: itemHeight }}
        aria-hidden
      />
      <ul
        ref={listRef}
        role="listbox"
        aria-label={ariaLabel}
        className="relative z-10 h-full snap-y snap-mandatory overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          paddingTop: itemHeight * paddingRows,
          paddingBottom: itemHeight * paddingRows,
        }}
        onScroll={handleScroll}
      >
        {options.map((option) => {
          const selected = option === value;
          return (
            <li
              key={option}
              role="option"
              aria-selected={selected}
              className="relative z-10 flex snap-center items-center justify-center text-[16px] leading-none tabular-nums"
              style={{ height: itemHeight }}
            >
              <span
                className={`${selected
                    ? " font-bold text-[#0091b2]"
                    : " font-medium text-[#4d5257]/55"}`}
              >
                {option}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
