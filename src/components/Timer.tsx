"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Exercise, TimerPhase, CompletedExercise } from "@/lib/types";
import { formatSeconds, todayStr } from "@/lib/utils";
import { saveCompletedExercise } from "@/lib/storage";

interface TimerProps {
  exercise: Exercise;
  onFinish: () => void;
  onCancel: () => void;
}

export default function Timer({ exercise, onFinish, onCancel }: TimerProps) {
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [currentSet, setCurrentSet] = useState(1);
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 开始一组训练（倒计时 = 每组次数 × 3秒，模拟训练时间）
  const startSet = useCallback(() => {
    setPhase("exercising");
    const duration = exercise.reps * 3; // 每个动作约3秒
    setCountdown(duration);
  }, [exercise.reps]);

  // 开始休息
  const startRest = useCallback(() => {
    setPhase("resting");
    setCountdown(exercise.restSeconds);
  }, [exercise.restSeconds]);

  // 倒计时逻辑
  useEffect(() => {
    if (phase === "idle" || phase === "done") {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimer();
          if (phase === "exercising") {
            if (currentSet >= exercise.sets) {
              // 全部完成
              setPhase("done");
              const entry: CompletedExercise = {
                exerciseId: exercise.id,
                exerciseName: exercise.name,
                bodyPart: exercise.bodyPart,
                completedSets: exercise.sets,
                totalSets: exercise.sets,
                completedAt: new Date().toISOString(),
              };
              saveCompletedExercise(todayStr(), entry);
            } else {
              startRest();
            }
          } else if (phase === "resting") {
            setCurrentSet((s) => s + 1);
            startSet();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [phase, currentSet, exercise, clearTimer, startRest, startSet]);

  const progressPercent =
    phase === "exercising"
      ? ((exercise.reps * 3 - countdown) / (exercise.reps * 3)) * 100
      : phase === "resting"
        ? ((exercise.restSeconds - countdown) / exercise.restSeconds) * 100
        : 0;

  const phaseColor =
    phase === "exercising"
      ? "text-green-500"
      : phase === "resting"
        ? "text-blue-500"
        : phase === "done"
          ? "text-yellow-500"
          : "text-gray-500";

  const ringColor =
    phase === "exercising"
      ? "stroke-green-500"
      : phase === "resting"
        ? "stroke-blue-500"
        : "stroke-gray-300";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {exercise.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          第 {currentSet} 组 / 共 {exercise.sets} 组 · 每组 {exercise.reps} 次
        </p>

        {/* 圆形进度 */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-gray-200 dark:stroke-gray-700" />
            <circle
              cx="60" cy="60" r="54" fill="none" strokeWidth="8"
              strokeLinecap="round"
              className={`${ringColor} transition-all duration-1000`}
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progressPercent / 100)}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold font-mono ${phaseColor}`}>
              {phase === "idle" ? "--:--" : phase === "done" ? "🎉" : formatSeconds(countdown)}
            </span>
            <span className="text-xs text-gray-400 mt-1">
              {phase === "idle" && "准备开始"}
              {phase === "exercising" && "训练中"}
              {phase === "resting" && "休息中"}
              {phase === "done" && "全部完成！"}
            </span>
          </div>
        </div>

        {/* 组数指示器 */}
        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: exercise.sets }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < currentSet - 1 || (i === currentSet - 1 && (phase === "resting" || phase === "done"))
                  ? "bg-green-500"
                  : i === currentSet - 1 && phase === "exercising"
                    ? "bg-green-500 animate-pulse"
                    : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>

        {/* 按钮 */}
        <div className="flex gap-3">
          {phase === "idle" && (
            <button
              onClick={startSet}
              className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
            >
              🚀 开始训练
            </button>
          )}
          {phase === "done" && (
            <button
              onClick={onFinish}
              className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-colors"
            >
              ✅ 完成
            </button>
          )}
          {(phase === "idle" || phase === "done") && (
            <button
              onClick={() => { clearTimer(); onCancel(); }}
              className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              返回
            </button>
          )}
          {(phase === "exercising" || phase === "resting") && (
            <button
              onClick={() => { clearTimer(); onCancel(); }}
              className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
            >
              ⏹ 停止
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
