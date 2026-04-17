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
      className={`rounded-xl border p-4 transition-all ${
        isCompletedToday
          ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
          : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isCompletedToday && <span className="text-green-500">✅</span>}
          <h4
            className={`font-semibold ${
              isCompletedToday
                ? "text-green-700 dark:text-green-400"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {exercise.name}
          </h4>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            title="编辑"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="删除"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span>{exercise.sets} 组</span>
        <span>×</span>
        <span>{exercise.reps} 次</span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span>休息 {exercise.restSeconds}s</span>
      </div>

      <button
        onClick={onStart}
        disabled={isCompletedToday}
        className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
          isCompletedToday
            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 cursor-default"
            : "bg-indigo-500 hover:bg-indigo-600 text-white"
        }`}
      >
        {isCompletedToday ? "已完成 ✓" : "▶ 开始训练"}
      </button>
    </div>
  );
}
