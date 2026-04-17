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

  // 生成日历格子
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getCompletionLevel = (day: number): { level: number; parts: Set<BodyPart> } => {
    const dateStr = getDateStr(day);
    const log = logMap[dateStr];
    if (!log || log.completedExercises.length === 0) return { level: 0, parts: new Set() };
    const parts = new Set<BodyPart>(log.completedExercises.map((e) => e.bodyPart));
    const count = log.completedExercises.length;
    if (count >= 6) return { level: 3, parts };
    if (count >= 3) return { level: 2, parts };
    return { level: 1, parts };
  };

  const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
  const MONTH_NAMES = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月",
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
        >
          ◀
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {year}年 {MONTH_NAMES[month]}
        </h3>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
        >
          ▶
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;
          const dateStr = getDateStr(day);
          const isToday = dateStr === todayStr;
          const { level, parts } = getCompletionLevel(day);

          return (
            <div
              key={day}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-colors ${
                isToday
                  ? "ring-2 ring-indigo-500 font-bold"
                  : ""
              } ${
                level === 0
                  ? "text-gray-600 dark:text-gray-400"
                  : level === 1
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : level === 2
                      ? "bg-green-300 dark:bg-green-800/50 text-green-800 dark:text-green-300"
                      : "bg-green-500 dark:bg-green-700 text-white"
              }`}
              title={
                level > 0
                  ? `完成 ${Array.from(parts).map((p) => BODY_PARTS[p].label).join("、")} 训练`
                  : undefined
              }
            >
              <span>{day}</span>
              {level > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from(parts).map((p) => (
                    <span key={p} className="text-[8px] leading-none">
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
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 inline-block" /> 少量
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-300 dark:bg-green-800/50 inline-block" /> 中等
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500 dark:bg-green-700 inline-block" /> 充分
        </span>
      </div>
    </div>
  );
}
