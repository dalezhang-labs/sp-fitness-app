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
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseForm from "@/components/ExerciseForm";
import Timer from "@/components/Timer";
import Calendar from "@/components/Calendar";

type View = "training" | "calendar";

export default function Home() {
  const [view, setView] = useState<View>("training");
  const [activePart, setActivePart] = useState<BodyPart>("arms");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [todayLog, setTodayLog] = useState<DayLog>({ date: todayStr(), completedExercises: [] });
  const [allLogs, setAllLogs] = useState<DayLog[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // 弹窗状态
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [activeTimer, setActiveTimer] = useState<Exercise | null>(null);

  const refreshData = useCallback(() => {
    setExercises(getExercisesByPart(activePart));
    setTodayLog(getDayLog(todayStr()));
    setAllLogs(getAllLogs());
  }, [activePart]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const isCompletedToday = (exerciseId: string) =>
    todayLog.completedExercises.some((e) => e.exerciseId === exerciseId);

  const handleSaveExercise = (exercise: Exercise) => {
    saveExercise(exercise);
    setShowForm(false);
    setEditingExercise(null);
    refreshData();
  };

  const handleDeleteExercise = (id: string) => {
    if (confirm("确定删除这个训练动作？")) {
      deleteExercise(id);
      refreshData();
    }
  };

  const handleTimerFinish = () => {
    setActiveTimer(null);
    refreshData();
  };

  // 统计
  const todayCompleted = todayLog.completedExercises.length;
  const todayParts = new Set(todayLog.completedExercises.map((e) => e.bodyPart));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                💪 SP Fitness
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                今日已完成 {todayCompleted} 项训练
                {todayParts.size > 0 && (
                  <span className="ml-1">
                    · {Array.from(todayParts).map((p) => BODY_PARTS[p].emoji).join("")}
                  </span>
                )}
              </p>
            </div>
            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
              <button
                onClick={() => setView("training")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === "training"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                训练
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === "calendar"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                日历
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {view === "training" ? (
          <>
            {/* Body Part Tabs */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
              {(Object.keys(BODY_PARTS) as BodyPart[]).map((part) => {
                const info = BODY_PARTS[part];
                const isActive = activePart === part;
                const partCompleted = todayLog.completedExercises.filter(
                  (e) => e.bodyPart === part
                ).length;
                return (
                  <button
                    key={part}
                    onClick={() => setActivePart(part)}
                    className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all ${
                      isActive
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="text-2xl mb-1">{info.emoji}</div>
                    <div
                      className={`text-sm font-semibold ${
                        isActive
                          ? "text-indigo-700 dark:text-indigo-300"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {info.label}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {partCompleted > 0 ? `已完成 ${partCompleted} 项` : info.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Exercise List */}
            <div className="space-y-3 mb-6">
              {exercises.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <div className="text-4xl mb-2">🏋️</div>
                  <p>还没有训练动作</p>
                  <p className="text-sm">点击下方按钮添加</p>
                </div>
              ) : (
                exercises.map((ex) => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    isCompletedToday={isCompletedToday(ex.id)}
                    onStart={() => setActiveTimer(ex)}
                    onEdit={() => {
                      setEditingExercise(ex);
                      setShowForm(true);
                    }}
                    onDelete={() => handleDeleteExercise(ex.id)}
                  />
                ))
              )}
            </div>

            {/* Add Button */}
            <button
              onClick={() => {
                setEditingExercise(null);
                setShowForm(true);
              }}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors font-medium"
            >
              + 添加训练动作
            </button>
          </>
        ) : (
          /* Calendar View */
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

      {/* Modals */}
      {showForm && (
        <ExerciseForm
          bodyPart={activePart}
          existing={editingExercise}
          onSave={handleSaveExercise}
          onCancel={() => {
            setShowForm(false);
            setEditingExercise(null);
          }}
        />
      )}

      {activeTimer && (
        <Timer
          exercise={activeTimer}
          onFinish={handleTimerFinish}
          onCancel={() => setActiveTimer(null)}
        />
      )}
    </div>
  );
}
