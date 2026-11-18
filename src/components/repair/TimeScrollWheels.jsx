"use client";

import { useMemo } from "react";
import { ScrollWheelPicker } from "@/components/ScrollWheelPicker";

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0"),
);

function parseTime(value) {
  const match = String(value ?? "").match(/^(\d{2}):(\d{2})$/);
  if (!match) return { hour: "10", minute: "00" };
  return { hour: match[1], minute: match[2] };
}

function formatTime(hour, minute) {
  return `${hour}:${minute}`;
}

function hourOptions(minHour, maxHour) {
  return Array.from({ length: maxHour - minHour + 1 }, (_, index) =>
    String(minHour + index).padStart(2, "0"),
  );
}

/**
 * @param {{ value: string; onChange: (value: string) => void; minHour?: number; maxHour?: number; className?: string }} props
 */
export function TimeScrollWheels({
  value,
  onChange,
  minHour = 8,
  maxHour = 22,
  className,
}) {
  const hours = useMemo(() => hourOptions(minHour, maxHour), [minHour, maxHour]);
  const { hour, minute } = parseTime(value);

  return (
    <div
      className={`flex max-h-[96px] overflow-hidden rounded-lg border border-[#c6ccd2] bg-white shadow-sm ${className ?? ""}`}
    >
      <ScrollWheelPicker
        aria-label="小時"
        options={hours}
        value={hour}
        onChange={(nextHour) => onChange(formatTime(nextHour, minute))}
      />
      <span className="flex w-4 shrink-0 items-center justify-center text-[13px] font-bold text-[#797979]">
        :
      </span>
      <ScrollWheelPicker
        aria-label="分鐘"
        options={MINUTE_OPTIONS}
        value={minute}
        onChange={(nextMinute) => onChange(formatTime(hour, nextMinute))}
      />
    </div>
  );
}

export function timeToMinutes(value) {
  const { hour, minute } = parseTime(value);
  return Number(hour) * 60 + Number(minute);
}

export function bumpEndTime(startTime, endTime, minGapMinutes = 30) {
  const startM = timeToMinutes(startTime);
  let endM = timeToMinutes(endTime);
  if (endM > startM) return endTime;
  endM = startM + minGapMinutes;
  const maxM = 22 * 60;
  endM = Math.min(endM, maxM);
  const h = String(Math.floor(endM / 60)).padStart(2, "0");
  const m = String(endM % 60).padStart(2, "0");
  return `${h}:${m}`;
}
