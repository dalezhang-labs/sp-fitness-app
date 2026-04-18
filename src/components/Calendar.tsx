"use client";

import { useMemo } from "react";
import { DayLog, BODY_PARTS, BodyPart } from "@/lib/types";

interface CalendarProps {
  logs: DayLog[];
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function Calendar({ logs, currentMonth, onPrevMonth, onNextMonth }: CalendarProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const logMap = useMemo(() => {
    const map: Record<string, DayLog> = {};
    logs.forEach((l) => (map[l.date] = l));
    return map;
  }, [logs]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getInfo = (day: number) => {
    const log = logMap[getDateStr(day)];
    if (!log || log.completedExercises.length === 0) return { level: 0, parts: [] as BodyPart[] };
    const parts = [...new Set(log.completedExercises.map((e) => e.bodyPart as BodyPart))];
    const n = log.completedExercises.length;
    return { level: n >= 6 ? 3 : n >= 3 ? 2 : 1, parts };
  };

  const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
  const MONTHS = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];

  // Intensity colors using OKLCH
  const levelBg = [
    "transparent",
    "oklch(90% 0.08 145 / 0.5)",
    "oklch(75% 0.14 145 / 0.7)",
    "oklch(58% 0.18 145)",
  ];
  const levelText = [
    "var(--text-secondary)",
    "oklch(38% 0.14 145)",
    "oklch(30% 0.12 145)",
    "white",
  ];

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Month nav */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onPrevMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "var(--text-tertiary)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {year}年 {MONTHS[month]}
        </h3>
        <button
          onClick={onNextMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "var(--text-tertiary)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium py-1"
            style={{ color: "var(--text-tertiary)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const dateStr = getDateStr(day);
          const isToday = dateStr === todayStr;
          const { level, parts } = getInfo(day);

          return (
            <div
              key={day}
              className="aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all"
              style={{
                background: levelBg[level],
                outline: isToday ? "2px solid var(--brand-500)" : "none",
                outlineOffset: "-1px",
              }}
              title={
                parts.length > 0
                  ? parts.map((p) => BODY_PARTS[p].label).join("、")
                  : undefined
              }
            >
              <span
                className="text-xs tabular font-medium"
                style={{ color: levelText[level] }}
              >
                {day}
              </span>
              {parts.length > 0 && (
                <div className="flex gap-px mt-0.5">
                  {parts.map((p) => (
                    <span key={p} className="text-[7px] leading-none">
                      {BODY_PARTS[p].emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        className="flex items-center justify-center gap-4 mt-4 pt-4 text-xs"
        style={{
          borderTop: "1px solid var(--border)",
          color: "var(--text-tertiary)",
        }}
      >
        {[["少量", 1], ["中等", 2], ["充分", 3]].map(([label, level]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded"
              style={{ background: levelBg[level as number] }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
