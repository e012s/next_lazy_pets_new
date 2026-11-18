"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PANEL_BODY_HEIGHT = "h-[252px]";
const dobYearMax = new Date().getFullYear();
const dobYearMin = 1920;
const dobYearOptions = Array.from(
  { length: dobYearMax - dobYearMin + 1 },
  (_, index) => dobYearMax - index,
);
const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

function dobToIso(dob) {
  const match = dob.trim().match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return "";
  const [, y, m, d] = match;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function dobViewDate(dob) {
  const iso = dobToIso(dob);
  if (!iso) return new Date();
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDobParts(year, month, day) {
  return `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function buildCalendarCells(year, month) {
  const monthStartWeekday = new Date(year, month - 1, 1).getDay();
  const totalDays = daysInMonth(year, month);
  const cells = [];
  for (let index = 0; index < monthStartWeekday; index += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(day);
  }
  while (cells.length < 42) {
    cells.push(null);
  }
  return cells;
}

export function DobDatePickerPopover({ open, anchorRef, value, onChange, onClose }) {
  const popoverRef = useRef(null);
  const yearListRef = useRef(null);
  const wasOpenRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState(null);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [panel, setPanel] = useState("days");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const view = dobViewDate(value);
      setViewYear(view.getFullYear());
      setViewMonth(view.getMonth() + 1);
      setPanel("days");
    }
    wasOpenRef.current = open;
  }, [open, value]);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    function updatePosition() {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const width = 300;
      const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
      setPos({ top: rect.bottom + 4, left, width });
    }
    updatePosition();
    function onScroll(event) {
      const target = event.target;
      if (target instanceof Node && popoverRef.current?.contains(target)) return;
      updatePosition();
    }
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (popoverRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onClose, anchorRef]);

  useEffect(() => {
    if (panel !== "year") return;
    const list = yearListRef.current;
    const selected = list?.querySelector('[data-selected="true"]');
    if (!list || !selected) return;
    list.scrollTop = selected.offsetTop - (list.clientHeight - selected.offsetHeight) / 2;
  }, [panel]);

  if (!mounted || !open || !pos) return null;

  const selectedIso = dobToIso(value);
  const cells = buildCalendarCells(viewYear, viewMonth);

  function shiftMonth(delta) {
    const next = new Date(viewYear, viewMonth - 1 + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth() + 1);
    setPanel("days");
  }

  function openPanel(next) {
    setPanel((current) => (current === next ? "days" : next));
  }

  const navButtonClass =
    "flex size-10 shrink-0 items-center justify-center rounded-lg text-[22px] leading-none text-[#4d5257] hover:bg-[#eef0f3]";
  const menuButtonClass =
    "flex h-10 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border border-[#c6ccd2] bg-white px-2 text-[16px] leading-5 font-medium text-[#4d5257] hover:bg-[#f9fafc]";

  return createPortal(
    <>
      <div
        ref={popoverRef}
        data-lazy-calendar-popover=""
        className="pointer-events-auto fixed z-[210]"
        style={{ top: pos.top, left: pos.left, width: pos.width }}
        onPointerDown={(event) => event.stopPropagation()}
      >
      <div
        className="rounded-lg border border-[#c6ccd2] bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
        role="dialog"
        aria-label="選擇出生日期"
      >
        <div className="mb-2 flex items-center gap-2">
          <button type="button" className={navButtonClass} aria-label="上一個月" onClick={() => shiftMonth(-1)}>
            ‹
          </button>
          <button
            type="button"
            className={`${menuButtonClass} ${panel === "year" ? " border-[#0091b2] text-[#0091b2]" : ""}`}
            aria-expanded={panel === "year"}
            onClick={() => openPanel("year")}
          >
            <span>{viewYear}年</span>
            <span className="text-[12px] text-[#797979]" aria-hidden>
              ▾
            </span>
          </button>
          <button
            type="button"
            className={`${menuButtonClass} ${panel === "month" ? " border-[#0091b2] text-[#0091b2]" : ""}`}
            aria-expanded={panel === "month"}
            onClick={() => openPanel("month")}
          >
            <span>{viewMonth}月</span>
            <span className="text-[12px] text-[#797979]" aria-hidden>
              ▾
            </span>
          </button>
          <button type="button" className={navButtonClass} aria-label="下一個月" onClick={() => shiftMonth(1)}>
            ›
          </button>
        </div>

        <div className={`${PANEL_BODY_HEIGHT} relative overflow-hidden`}>
          {panel === "days" ? (
            <div className="flex h-full flex-col">
              <div className="grid shrink-0 grid-cols-7 gap-0 text-center text-[12px] text-[#797979]">
                {WEEKDAY_LABELS.map((label) => (
                  <span key={label} className="py-1 font-medium">
                    {label}
                  </span>
                ))}
              </div>
              <div className="grid flex-1 grid-cols-7 grid-rows-6 gap-0 text-center text-[14px] text-[#4d5257]">
                {cells.map((day, index) => {
                  if (day === null) {
                    return <span key={`empty-${index}`} className="h-9" />;
                  }
                  const iso = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isSelected = iso === selectedIso;
                  const isToday =
                    today.getFullYear() === viewYear &&
                    today.getMonth() + 1 === viewMonth &&
                    today.getDate() === day;
                  return (
                    <button
                      key={`day-${index}`}
                      type="button"
                      className={`mx-auto flex h-9 w-9 items-center justify-center rounded-md${isSelected ? " bg-[#0091b2] font-medium text-white" : ""} ${!isSelected && isToday ? " ring-1 ring-[#0091b2]" : ""} ${!isSelected && !isToday ? " hover:bg-[#eef0f3]" : ""}`}
                      onClick={() => {
                        onChange(formatDobParts(viewYear, viewMonth, day));
                        onClose();
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {panel === "year" ? (
            <div
              ref={yearListRef}
              className="absolute inset-0 z-20 touch-pan-y overflow-y-auto overscroll-y-contain rounded-lg border border-[#e5e7eb] bg-white shadow-sm [-webkit-overflow-scrolling:touch]"
              role="listbox"
              aria-label="選擇年份"
              data-vaul-no-drag=""
              onWheel={(event) => event.stopPropagation()}
              onTouchMove={(event) => event.stopPropagation()}
            >
              {dobYearOptions.map((year) => (
                <button
                  key={year}
                  type="button"
                  role="option"
                  aria-selected={year === viewYear}
                  data-selected={year === viewYear ? "true" : undefined}
                  className={`block w-full px-3 py-2.5 text-left text-[16px] leading-5 text-[#4d5257]${year === viewYear ? " bg-[#e6f4f7] font-bold text-[#0091b2]" : ""}`}
                  onClick={() => {
                    setViewYear(year);
                    setPanel("days");
                  }}
                >
                  {year}年
                </button>
              ))}
            </div>
          ) : null}

          {panel === "month" ? (
            <div
              className="absolute inset-0 z-20 flex items-center bg-white p-2"
              role="listbox"
              aria-label="選擇月份"
            >
              <div className="grid w-full grid-cols-4 gap-1.5">
                {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                  <button
                    key={month}
                    type="button"
                    role="option"
                    aria-selected={month === viewMonth}
                    className={`h-10 rounded-lg border text-[14px] leading-5 font-medium${month === viewMonth
                        ? " border-[#0091b2] bg-[#0091b2] text-white"
                        : " border-[#e5e7eb] bg-white text-[#4d5257] hover:bg-[#eef0f3]"}`}
                    onClick={() => {
                      setViewMonth(month);
                      setPanel("days");
                    }}
                  >
                    {month}月
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-2 flex justify-between border-t border-[#e5e7eb] pt-2 text-[13px] text-[#0091b2]">
          <button
            type="button"
            onClick={() => {
              onChange("");
              onClose();
            }}
          >
            清除
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(formatDobParts(today.getFullYear(), today.getMonth() + 1, today.getDate()));
              onClose();
            }}
          >
            今天
          </button>
        </div>
      </div>
      </div>
    </>,
    document.body,
  );
}
