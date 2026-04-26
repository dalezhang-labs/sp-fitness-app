"use client";

import { useMemo, useState } from "react";
import { DayLog, BODY_PARTS, BodyPart } from "@/lib/types";

interface CalendarProps {
  logs: DayLog[];
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToday?: () => void;
}

export default function Calendar({ logs, currentMonth, onPrevMonth, onNextMonth, onGoToday }: CalendarProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // #7 fix: check if current view is the current month (disable next if so or future)
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const isFutureMonth = year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth());

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getInfo = (day: number) => {
    const log = logMap[getDateStr(day)];
    if (!log || log.completedExercises.length === 0) return { level: 0, parts: [] as BodyPart[], log: null };
    const parts = [...new Set(log.completedExercises.map((e) => e.bodyPart as BodyPart))];
    const n = log.completedExercises.length;
    return { level: n >= 6 ? 3 : n >= 3 ? 2 : 1, parts, log };
  };

  const selectedLog = selectedDate ? logMap[selectedDate] : null;

  const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
  const MONTHS = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];

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

  // #7 fix: go to today handler
  const handleGoToday = () => {
    setSelectedDate(todayStr);
    onGoToday?.();
  };

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Month nav — #7 fix: Today button + disable future */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onPrevMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          aria-label="上个月"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {year}年 {MONTHS[month]}
          </h3>
          {!isCurrentMonth && (
            <button
              onClick={handleGoToday}
              className="text-xs px-2 py-0.5 rounded-full font-medium transition-colors"
              style={{
                background: "var(--brand-100)",
                color: "var(--brand-600)",
              }}
            >
              今天
            </button>
          )}
        </div>

        <button
          onClick={onNextMonth}
          disabled={isFutureMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{
            color: isFutureMonth ? "var(--border)" : "var(--text-tertiary)",
            cursor: isFutureMonth ? "not-allowed" : "pointer",
          }}
          aria-label="下个月"
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

      {/* Day cells — #6 fix: clickable */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const dateStr = getDateStr(day);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const { level, parts } = getInfo(day);
          const hasData = parts.length > 0;

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className="aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all"
              style={{
                background: isSelected ? "var(--brand-100)" : levelBg[level],
                outline: isToday ? "2px solid var(--brand-500)" : "none",
                outlineOffset: "-1px",
                cursor: hasData ? "pointer" : "default",
              }}
              aria-label={`${month + 1}月${day}日${hasData ? `，${parts.map(p => BODY_PARTS[p].label).join("、")}` : ""}`}
            >
              <span
                className="text-xs tabular font-medium"
                style={{ color: isSelected ? "var(--brand-700)" : levelText[level] }}
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
            </button>
          );
        })}
      </div>

      {/* #6 fix: Day detail panel */}
      {selectedDate && selectedLog && selectedLog.completedExercises.length > 0 && (
        <div
          className="mt-4 pt-4 space-y-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              {selectedDate} 训练详情
            </p>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "var(--brand-100)", color: "var(--brand-700)" }}
            >
              {selectedLog.completedExercises.length} 项
            </span>
          </div>
          {selectedLog.completedExercises.map((ex, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-3 py-2 rounded-lg"
              style={{ background: "var(--surface-base)" }}
            >
              <span className="text-sm">{BODY_PARTS[ex.bodyPart]?.emoji ?? "🏋️"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {ex.exerciseName}
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  {ex.completedSets}/{ex.totalSets} 组
                  <span className="mx-1">·</span>
                  {new Date(ex.completedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <span className="text-xs" style={{ color: "var(--success)" }}>✓</span>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div
        className="flex items-center justify-center gap-4 mt-4 pt-4 text-xs"
        style={{
          borderTop: selectedLog ? "none" : "1px solid var(--border)",
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
