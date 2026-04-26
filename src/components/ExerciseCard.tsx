"use client";

import { Exercise } from "@/lib/types";

interface ExerciseCardProps {
  exercise: Exercise;
  isCompletedToday: boolean;
  onStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ExerciseCard({
  exercise,
  isCompletedToday,
  onStart,
  onEdit,
  onDelete,
}: ExerciseCardProps) {
  return (
    <div
      className="rounded-xl px-4 py-3.5 flex items-center gap-4 transition-all group"
      style={{
        background: isCompletedToday
          ? "oklch(96% 0.04 145 / 0.5)"
          : "var(--surface-raised)",
        border: isCompletedToday
          ? "1px solid oklch(80% 0.10 145 / 0.4)"
          : "1px solid var(--border)",
        boxShadow: isCompletedToday ? "none" : "var(--shadow-sm)",
        transitionDuration: "var(--duration-normal)",
      }}
    >
      {/* Completion indicator */}
      <div
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all"
        style={{
          background: isCompletedToday ? "var(--success)" : "transparent",
          border: isCompletedToday ? "none" : "1.5px solid var(--border-strong)",
          transitionDuration: "var(--duration-normal)",
        }}
      >
        {isCompletedToday && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold leading-tight truncate"
          style={{
            color: isCompletedToday ? "var(--success-dark)" : "var(--text-primary)",
            textDecoration: isCompletedToday ? "line-through" : "none",
            textDecorationColor: "var(--success)",
          }}
        >
          {exercise.name}
        </p>
        <p className="text-xs mt-0.5 tabular" style={{ color: "var(--text-tertiary)" }}>
          {exercise.sets} 组 × {exercise.reps} 次
          <span className="mx-1.5" style={{ color: "var(--border-strong)" }}>·</span>
          休息 {exercise.restSeconds}s
        </p>
      </div>

      {/* Actions — #1 fix: always visible on touch, hover-reveal on desktop */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onEdit}
          className="w-7 h-7 rounded-lg flex items-center justify-center
                     opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                     sm:group-focus-within:opacity-100 transition-opacity"
          style={{
            color: "var(--text-tertiary)",
            transitionDuration: "var(--duration-fast)",
          }}
          aria-label="编辑"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M9.5 1.5L11.5 3.5L4.5 10.5H2.5V8.5L9.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center
                     opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                     sm:group-focus-within:opacity-100 transition-opacity"
          style={{
            color: "var(--text-tertiary)",
            transitionDuration: "var(--duration-fast)",
          }}
          aria-label="删除"
        >
          <svg width="12" height="13" viewBox="0 0 12 13" fill="none">
            <path d="M1 3H11M4 3V2H8V3M2 3L3 11H9L10 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Start button */}
        <button
          onClick={onStart}
          disabled={isCompletedToday}
          className="ml-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: isCompletedToday
              ? "oklch(90% 0.06 145 / 0.5)"
              : "var(--brand-500)",
            color: isCompletedToday
              ? "var(--success-dark)"
              : "white",
            cursor: isCompletedToday ? "default" : "pointer",
            transitionDuration: "var(--duration-normal)",
          }}
        >
          {isCompletedToday ? "已完成" : "开始"}
        </button>
      </div>
    </div>
  );
}
