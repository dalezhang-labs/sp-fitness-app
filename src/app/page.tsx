"use client";

import { useState, useEffect, useCallback } from "react";
import { BodyPart, BODY_PARTS, Exercise, DayLog } from "@/lib/types";
import {
  getExercisesByPart,
  saveExercise,
  deleteExercise,
  getDayLog,
  getAllLogs,
} from "@/lib/storage";
import { todayStr } from "@/lib/utils";
import { useSound, getSoundEnabled, setSoundEnabled } from "@/lib/useSound";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseForm from "@/components/ExerciseForm";
import Timer from "@/components/Timer";
import Calendar from "@/components/Calendar";

type View = "training" | "calendar";

const PART_CONFIG: Record<BodyPart, { color: string; bg: string; ring: string }> = {
  arms:      { color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/30",   ring: "ring-amber-400" },
  shoulders: { color: "text-sky-600 dark:text-sky-400",       bg: "bg-sky-50 dark:bg-sky-950/30",       ring: "ring-sky-400" },
  abs:       { color: "text-rose-600 dark:text-rose-400",     bg: "bg-rose-50 dark:bg-rose-950/30",     ring: "ring-rose-400" },
};

export default function Home() {
  const [view, setView] = useState<View>("training");
  const [activePart, setActivePart] = useState<BodyPart>("arms");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [todayLog, setTodayLog] = useState<DayLog>({ date: todayStr(), completedExercises: [] });
  const [allLogs, setAllLogs] = useState<DayLog[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [activeTimer, setActiveTimer] = useState<Exercise | null>(null);

  const { play } = useSound();

  // Sync sound preference from localStorage on mount
  useEffect(() => { setSoundOn(getSoundEnabled()); }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) play("click");
  };

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [exs, log, logs] = await Promise.all([
        getExercisesByPart(activePart),
        getDayLog(todayStr()),
        getAllLogs(),
      ]);
      setExercises(exs);
      setTodayLog(log);
      setAllLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activePart]);

  useEffect(() => { refreshData(); }, [refreshData]);

  const isCompletedToday = (id: string) =>
    todayLog.completedExercises.some((e) => e.exerciseId === id);

  const handleSaveExercise = async (exercise: Exercise) => {
    await saveExercise(exercise);
    play("click");
    setShowForm(false);
    setEditingExercise(null);
    refreshData();
  };

  const handleDeleteExercise = async (id: string) => {
    if (confirm("确定删除这个训练动作？")) {
      play("cancel");
      await deleteExercise(id);
      refreshData();
    }
  };

  const todayCompleted = todayLog.completedExercises.length;
  const todayParts = new Set(todayLog.completedExercises.map((e) => e.bodyPart));

  // Today's streak-style summary
  const partStats = (Object.keys(BODY_PARTS) as BodyPart[]).map((p) => ({
    part: p,
    count: todayLog.completedExercises.filter((e) => e.bodyPart === p).length,
  }));

  return (
    <div className="min-h-screen" style={{ background: "var(--surface-base)" }}>

      {/* ── Header ─────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "var(--surface-raised)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="max-w-xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">💪</span>
            <span
              className="text-base font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              SP Fitness
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              title={soundOn ? "关闭音效" : "开启音效"}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{
                background: soundOn ? "var(--brand-100)" : "var(--surface-base)",
                color: soundOn ? "var(--brand-600)" : "var(--text-tertiary)",
                border: "1px solid var(--border)",
                transitionDuration: "var(--duration-normal)",
              }}
              aria-label={soundOn ? "关闭音效" : "开启音效"}
              aria-pressed={soundOn}
            >
              {soundOn ? (
                // Speaker with waves
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <path d="M2 5.5H4.5L8 2.5V12.5L4.5 9.5H2V5.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                  <path d="M10 5C10.8 5.8 11 6.4 11 7.5C11 8.6 10.8 9.2 10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M12 3.5C13.5 5 14 6.2 14 7.5C14 8.8 13.5 10 12 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              ) : (
                // Speaker muted
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <path d="M2 5.5H4.5L8 2.5V12.5L4.5 9.5H2V5.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                  <path d="M11 5.5L13.5 8M13.5 5.5L11 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              )}
            </button>

            {/* Pill toggle */}
            <div
              className="flex p-0.5 rounded-full"
              style={{ background: "var(--surface-base)" }}
            >
              {(["training", "calendar"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => { play("click"); setView(v); }}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: view === v ? "var(--brand-500)" : "transparent",
                    color: view === v ? "var(--text-inverse)" : "var(--text-secondary)",
                    transitionDuration: "var(--duration-normal)",
                  }}
                >
                  {v === "training" ? "训练" : "日历"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-5 py-6 space-y-6">

        {view === "training" ? (
          <>
            {/* ── Today summary strip ──────────────── */}
            <div
              className="rounded-2xl px-5 py-4"
              style={{
                background: "var(--surface-raised)",
                boxShadow: "var(--shadow-sm)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
                  今日进度
                </p>
                <span
                  className="text-xs font-semibold tabular px-2 py-0.5 rounded-full"
                  style={{
                    background: todayCompleted > 0 ? "var(--brand-100)" : "var(--neutral-100)",
                    color: todayCompleted > 0 ? "var(--brand-700)" : "var(--text-tertiary)",
                  }}
                >
                  {todayCompleted} 项完成
                </span>
              </div>
              <div className="flex gap-3">
                {partStats.map(({ part, count }) => {
                  const info = BODY_PARTS[part];
                  const cfg = PART_CONFIG[part];
                  return (
                    <div key={part} className="flex-1 text-center">
                      <div className="text-xl mb-1">{info.emoji}</div>
                      <div className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                        {info.label}
                      </div>
                      <div
                        className="text-xs tabular mt-0.5"
                        style={{ color: count > 0 ? undefined : "var(--text-tertiary)" }}
                      >
                        {count > 0 ? (
                          <span className={cfg.color}>{count} ✓</span>
                        ) : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Body part tabs ───────────────────── */}
            <div className="flex gap-2">
              {(Object.keys(BODY_PARTS) as BodyPart[]).map((part) => {
                const info = BODY_PARTS[part];
                const cfg = PART_CONFIG[part];
                const isActive = activePart === part;
                const partDone = todayLog.completedExercises.filter((e) => e.bodyPart === part).length;
                return (
                  <button
                    key={part}
                    onClick={() => { play("click"); setActivePart(part); }}
                    className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all"
                    style={{
                      background: isActive ? "var(--surface-raised)" : "transparent",
                      border: isActive ? "1.5px solid var(--border-strong)" : "1.5px solid transparent",
                      boxShadow: isActive ? "var(--shadow-sm)" : "none",
                      transitionDuration: "var(--duration-normal)",
                    }}
                  >
                    <span className="text-2xl">{info.emoji}</span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: isActive ? "var(--text-primary)" : "var(--text-tertiary)" }}
                    >
                      {info.label}
                    </span>
                    {partDone > 0 && (
                      <span className={`text-[10px] font-medium ${cfg.color}`}>
                        {partDone} 完成
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Exercise list ────────────────────── */}
            <div className="space-y-2">
              {loading ? (
                <div className="py-16 text-center" style={{ color: "var(--text-tertiary)" }}>
                  <div className="text-3xl mb-3 animate-pulse">⏳</div>
                  <p className="text-sm">加载中…</p>
                </div>
              ) : exercises.length === 0 ? (
                <div className="py-16 text-center" style={{ color: "var(--text-tertiary)" }}>
                  <div className="text-3xl mb-3">🏋️</div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    还没有训练动作
                  </p>
                  <p className="text-xs mt-1">点击下方按钮添加</p>
                </div>
              ) : (
                exercises.map((ex) => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    isCompletedToday={isCompletedToday(ex.id)}
                    onStart={() => { play("click"); setActiveTimer(ex); }}
                    onEdit={() => { play("click"); setEditingExercise(ex); setShowForm(true); }}
                    onDelete={() => handleDeleteExercise(ex.id)}
                  />
                ))
              )}
            </div>

            {/* ── Add button ───────────────────────── */}
            <button
              onClick={() => { play("click"); setEditingExercise(null); setShowForm(true); }}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                border: "1.5px dashed var(--border-strong)",
                color: "var(--text-tertiary)",
                transitionDuration: "var(--duration-normal)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--brand-400)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--brand-600)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-tertiary)";
              }}
            >
              + 添加训练动作
            </button>
          </>
        ) : (
          <Calendar
            logs={allLogs}
            currentMonth={calendarMonth}
            onPrevMonth={() =>
              setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))
            }
            onNextMonth={() =>
              setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))
            }
          />
        )}
      </main>

      {/* ── Modals ─────────────────────────────── */}
      {showForm && (
        <ExerciseForm
          bodyPart={activePart}
          existing={editingExercise}
          onSave={handleSaveExercise}
          onCancel={() => { setShowForm(false); setEditingExercise(null); }}
        />
      )}
      {activeTimer && (
        <Timer
          exercise={activeTimer}
          onFinish={() => { setActiveTimer(null); refreshData(); }}
          onCancel={() => setActiveTimer(null)}
        />
      )}
    </div>
  );
}
