"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatVisitSchedule } from "@/lib/format";
import { bumpEndTime, TimeScrollWheels } from "@/components/repair/TimeScrollWheels";

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];
const PANEL_BODY_HEIGHT = "h-[252px]";

/** Fixed overlay so opening the calendar does not grow the bottom-sheet scroll area. */
function CalendarFixedPopover({ open, anchorRef, onClose, children }) {
  const popoverRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) {0
      setPos(null);
      return;
    }
    function updatePosition() {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth - 16);
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      setPos({ top: rect.bottom + 6, left, width: Math.max(rect.width, width) });
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

  // No full-screen backdrop: it blocked scrolling the quote sheet under the modal.
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

  if (!mounted || !open || !pos) return null;

  return createPortal(
    <div
      ref={popoverRef}
      data-lazy-calendar-popover=""
      className="pointer-events-auto fixed z-[210]"
      style={{ top: pos.top, left: pos.left, width: pos.width }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  );
}

function dateToIso(dateSlash) {
  const match = String(dateSlash).trim().match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return "";
  const [, y, m, d] = match;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function formatDateParts(year, month, day) {
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

function InlineServiceCalendar({ value, onChange, onDone }) {
  const today = new Date();
  const yearMin = today.getFullYear();
  const yearMax = yearMin + 9;
  const yearOptions = Array.from(
    { length: yearMax - yearMin + 1 },
    (_, index) => yearMin + index,
  );

  const initial = value ? dateToIso(value).split("-").map(Number) : null;
  const [viewYear, setViewYear] = useState(initial?.[0] ?? yearMin);
  const [viewMonth, setViewMonth] = useState(initial?.[1] ?? today.getMonth() + 1);
  const [panel, setPanel] = useState("days");

  const selectedIso = dateToIso(value);
  const cells = buildCalendarCells(viewYear, viewMonth);

  function shiftMonth(delta) {
    const next = new Date(viewYear, viewMonth - 1 + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth() + 1);
    setPanel("days");
  }

  const navButtonClass =
    "flex size-10 shrink-0 items-center justify-center rounded-lg text-[22px] leading-none text-[#4d5257] hover:bg-[#eef0f3]";
  const menuButtonClass =
    "flex h-10 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border border-[#c6ccd2] bg-white px-2 text-[16px] leading-5 font-medium text-[#4d5257] hover:bg-[#f9fafc]";

  return (
    <div
      className="rounded-lg border border-[#c6ccd2] bg-white p-3 shadow-[0_8px_24px_rgba(16,40,48,0.14)]"
      role="dialog"
      aria-label="選擇上門日期"
    >
      <div className="mb-2 flex items-center gap-2">
        <button type="button" className={navButtonClass} aria-label="上一個月" onClick={() => shiftMonth(-1)}>
          ‹
        </button>
        <button
          type="button"
          className={`${menuButtonClass} ${panel === "year" ? " border-[#0091b2] text-[#0091b2]" : ""}`}
          onClick={() => setPanel((p) => (p === "year" ? "days" : "year"))}
        >
          <span>{viewYear}年</span>
          <span className="text-[12px] text-[#797979]" aria-hidden>
            ▾
          </span>
        </button>
        <button
          type="button"
          className={`${menuButtonClass} ${panel === "month" ? " border-[#0091b2] text-[#0091b2]" : ""}`}
          onClick={() => setPanel((p) => (p === "month" ? "days" : "month"))}
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
                const cellDate = new Date(viewYear, viewMonth - 1, day);
                const isPast =
                  cellDate <
                  new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isToday =
                  today.getFullYear() === viewYear &&
                  today.getMonth() + 1 === viewMonth &&
                  today.getDate() === day;
                return (
                  <button
                    key={`day-${index}`}
                    type="button"
                    disabled={isPast}
                    className={`mx-auto flex h-9 w-9 items-center justify-center rounded-md${isSelected ? " bg-[#0091b2] font-medium text-white" : ""} ${!isSelected && isToday ? " ring-1 ring-[#0091b2]" : ""} ${!isSelected && !isToday && !isPast ? " hover:bg-[#eef0f3]" : ""} ${isPast ? " cursor-not-allowed text-[#c6ccd2]" : ""}`}
                    onClick={() => {
                      onChange(formatDateParts(viewYear, viewMonth, day));
                      onDone();
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
            className="absolute inset-0 z-20 touch-pan-y overflow-y-auto overscroll-y-contain rounded-lg border border-[#e5e7eb] bg-white shadow-sm [-webkit-overflow-scrolling:touch]"
            data-vaul-no-drag=""
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            {yearOptions.map((year) => (
              <button
                key={year}
                type="button"
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
          <div className="absolute inset-0 z-20 flex items-center bg-white p-2">
            <div className="grid w-full grid-cols-4 gap-1.5">
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <button
                  key={month}
                  type="button"
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
            onDone();
          }}
        >
          清除
        </button>
        <button
          type="button"
          onClick={() => {
            onChange(
              formatDateParts(today.getFullYear(), today.getMonth() + 1, today.getDate()),
            );
            onDone();
          }}
        >
          今天
        </button>
      </div>
    </div>
  );
}

export function QuoteVisitTimeField({
  date,
  startTime,
  endTime,
  onDateChange,
  onStartChange,
  onEndChange,
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const dateButtonRef = useRef(null);

  function handleStartChange(nextStart) {
    onStartChange(nextStart);
    onEndChange(bumpEndTime(nextStart, endTime));
  }

  const summary = formatVisitSchedule(date, startTime, endTime);

  return (
    <div className="mt-2 space-y-2">
      <div>
        <button
          ref={dateButtonRef}
          type="button"
          className={`h-11 w-full rounded-xl border border-line bg-white px-3 text-field font-normal text-foreground outline-none placeholder:text-placeholder focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15 h-11 w-full text-left text-[14px]${!date ? " text-placeholder" : ""}`}
          aria-expanded={calendarOpen}
          onClick={() => setCalendarOpen((open) => !open)}
        >
          {date ? summary.split(" · ")[0] : "選擇日期"}
        </button>
        <CalendarFixedPopover
          open={calendarOpen}
          anchorRef={dateButtonRef}
          onClose={() => setCalendarOpen(false)}
        >
          <InlineServiceCalendar
            value={date}
            onChange={onDateChange}
            onDone={() => setCalendarOpen(false)}
          />
        </CalendarFixedPopover>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-medium text-[#797979]">開始</p>
          <TimeScrollWheels value={startTime} onChange={handleStartChange} />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-medium text-[#797979]">結束</p>
          <TimeScrollWheels value={endTime} onChange={onEndChange} />
        </div>
      </div>

      {date ? (
        <p className="text-[11px] leading-4 text-[#797979]">{summary}</p>
      ) : null}
    </div>
  );
}
