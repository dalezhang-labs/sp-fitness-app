"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Exercise, TimerPhase, CompletedExercise } from "@/lib/types";
import { formatSeconds, todayStr } from "@/lib/utils";
import { saveCompletedExercise } from "@/lib/storage";
import { useSound } from "@/lib/useSound";
import { toast } from "@/components/Toast";

interface TimerProps {
  exercise: Exercise;
  onFinish: () => void;
  onCancel: () => void;
}

export default function Timer({ exercise, onFinish, onCancel }: TimerProps) {
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [paused, setPaused] = useState(false);
  const [confirmStop, setConfirmStop] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [countdown, setCountdown] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickedRef = useRef<Set<number>>(new Set());
  const dialogRef = useRef<HTMLDivElement>(null);

  const { play } = useSound();

  const clearTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const startSet = useCallback(() => {
    const dur = exercise.reps * 3;
    setPhase("exercising");
    setPaused(false);
    setCountdown(dur);
    setTotalDuration(dur);
    tickedRef.current = new Set();
    play("setStart");
  }, [exercise.reps, play]);

  const startRest = useCallback(() => {
    setPhase("resting");
    setPaused(false);
    setCountdown(exercise.restSeconds);
    setTotalDuration(exercise.restSeconds);
    tickedRef.current = new Set();
    play("restStart");
  }, [exercise.restSeconds, play]);

  // #4 fix: Esc to close + focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (phase === "exercising" || phase === "resting") {
          setConfirmStop(true);
        } else {
          onCancel();
        }
        return;
      }
      // Focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [phase, onCancel]);

  useEffect(() => {
    if (phase === "idle" || phase === "done" || paused) { clearTimer(); return; }
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 3 && prev > 0 && !tickedRef.current.has(prev)) {
          tickedRef.current.add(prev);
          Promise.resolve().then(() => play("tick"));
        }

        if (prev <= 1) {
          clearTimer();
          if (phase === "exercising") {
            if (currentSet >= exercise.sets) {
              setPhase("done");
              Promise.resolve().then(() => play("complete"));
              const entry: CompletedExercise = {
                exerciseId: exercise.id,
                exerciseName: exercise.name,
                bodyPart: exercise.bodyPart,
                completedSets: exercise.sets,
                totalSets: exercise.sets,
                completedAt: new Date().toISOString(),
              };
              saveCompletedExercise(todayStr(), entry)
                .then(() => toast("训练记录已保存", "success"))
                .catch(() => toast("保存失败，请重试", "error"));
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
  }, [phase, paused, currentSet, exercise, clearTimer, startRest, startSet, play]);

  // #5 fix: pause/resume toggle
  const togglePause = () => {
    if (paused) {
      setPaused(false);
      play("click");
    } else {
      setPaused(true);
      clearTimer();
    }
  };

  // #5 fix: stop with confirmation
  const handleStopClick = () => {
    if (phase === "exercising" || phase === "resting") {
      setConfirmStop(true);
    } else {
      play("cancel");
      clearTimer();
      onCancel();
    }
  };

  const confirmStopAction = () => {
    play("cancel");
    clearTimer();
    setConfirmStop(false);
    onCancel();
  };

  const progress = totalDuration > 0 ? (totalDuration - countdown) / totalDuration : 0;
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference * (1 - progress);

  const phaseLabel = paused
    ? "已暂停"
    : { idle: "准备开始", exercising: "训练中", resting: "休息中", done: "完成！" }[phase];

  const accentColor = paused
    ? "var(--warning)"
    : phase === "exercising"
      ? "var(--brand-500)"
      : phase === "resting"
        ? "oklch(58% 0.18 220)"
        : phase === "done"
          ? "var(--success)"
          : "var(--border-strong)";

  const isActive = phase === "exercising" || phase === "resting";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "oklch(0% 0 0 / 0.6)", backdropFilter: "blur(8px)" }}
      role="dialog"
      aria-modal="true"
      aria-label={`${exercise.name} 计时器`}
    >
      <div ref={dialogRef}
        className="w-full max-w-sm rounded-2xl p-8 text-center"
        style={{
          background: "var(--surface-raised)",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Exercise name */}
        <h3
          className="text-base font-semibold mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          {exercise.name}
        </h3>
        <p className="text-xs mb-8" style={{ color: "var(--text-tertiary)" }}>
          第 {currentSet} 组 / 共 {exercise.sets} 组 · 每组 {exercise.reps} 次
        </p>

        {/* Ring timer */}
        <div className="relative w-40 h-40 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="52"
              fill="none" strokeWidth="6"
              stroke="var(--border)"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none" strokeWidth="6"
              strokeLinecap="round"
              stroke={accentColor}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: paused ? "none" : "stroke-dashoffset 1s linear, stroke 0.3s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {phase === "done" ? (
              <span className="text-4xl">🎉</span>
            ) : (
              <>
                <span
                  className="text-3xl font-semibold tabular"
                  style={{
                    color: phase === "idle" ? "var(--text-tertiary)" : "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                    opacity: paused ? 0.5 : 1,
                  }}
                >
                  {phase === "idle" ? "--:--" : formatSeconds(countdown)}
                </span>
                <span className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                  {phaseLabel}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Set dots */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: exercise.sets }).map((_, i) => {
            const done = i < currentSet - 1 || (i === currentSet - 1 && (phase === "resting" || phase === "done"));
            const active = i === currentSet - 1 && phase === "exercising";
            return (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: done
                    ? "var(--success)"
                    : active
                      ? "var(--brand-500)"
                      : "var(--border-strong)",
                  transform: active ? "scale(1.3)" : "scale(1)",
                  transitionDuration: "var(--duration-normal)",
                }}
              />
            );
          })}
        </div>

        {/* Stop confirmation overlay */}
        {confirmStop && (
          <div
            className="mb-4 p-3 rounded-xl"
            style={{ background: "var(--error-light)", border: "1px solid var(--error)" }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: "var(--error)" }}>
              确定停止训练？进度不会保存
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmStopAction}
                className="flex-1 py-2 rounded-lg text-xs font-semibold"
                style={{ background: "var(--error)", color: "white" }}
              >
                确定停止
              </button>
              <button
                onClick={() => setConfirmStop(false)}
                className="flex-1 py-2 rounded-lg text-xs font-medium"
                style={{
                  background: "var(--surface-base)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                继续训练
              </button>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          {phase === "idle" && (
            <button
              onClick={startSet}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "var(--brand-500)",
                color: "white",
                transitionDuration: "var(--duration-normal)",
              }}
            >
              开始训练
            </button>
          )}
          {phase === "done" && (
            <button
              onClick={() => { play("click"); onFinish(); }}
              className="flex-1 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "var(--success)", color: "white" }}
            >
              完成 ✓
            </button>
          )}

          {/* #5 fix: Pause/Resume button */}
          {isActive && !confirmStop && (
            <button
              onClick={togglePause}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: paused ? "var(--brand-500)" : "var(--surface-base)",
                color: paused ? "white" : "var(--text-secondary)",
                border: paused ? "none" : "1px solid var(--border)",
                transitionDuration: "var(--duration-normal)",
              }}
            >
              {paused ? "▶ 继续" : "⏸ 暂停"}
            </button>
          )}

          {!confirmStop && (
            <button
              onClick={handleStopClick}
              className="py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                flex: isActive ? "0 0 auto" : phase === "idle" ? "0 0 auto" : 1,
                paddingLeft: "1.25rem",
                paddingRight: "1.25rem",
                background: isActive
                  ? "var(--error-light)"
                  : "var(--surface-base)",
                color: isActive
                  ? "var(--error)"
                  : "var(--text-secondary)",
                border: "1px solid var(--border)",
                transitionDuration: "var(--duration-normal)",
              }}
            >
              {isActive ? "停止" : "返回"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
