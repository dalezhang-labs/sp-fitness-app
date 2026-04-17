"use client";

import { useState } from "react";
import { Exercise, BodyPart } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface ExerciseFormProps {
  bodyPart: BodyPart;
  existing?: Exercise | null;
  onSave: (exercise: Exercise) => void;
  onCancel: () => void;
}

export default function ExerciseForm({ bodyPart, existing, onSave, onCancel }: ExerciseFormProps) {
  const [name, setName] = useState(existing?.name || "");
  const [sets, setSets] = useState(existing?.sets || 4);
  const [reps, setReps] = useState(existing?.reps || 12);
  const [restSeconds, setRestSeconds] = useState(existing?.restSeconds || 60);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: existing?.id || generateId(),
      name: name.trim(),
      bodyPart,
      sets,
      reps,
      restSeconds,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {existing ? "编辑训练" : "添加训练"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              动作名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：哑铃弯举"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                组数
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={sets}
                onChange={(e) => setSets(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                每组次数
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                休息(秒)
              </label>
              <input
                type="number"
                min={10}
                max={300}
                step={5}
                value={restSeconds}
                onChange={(e) => setRestSeconds(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-colors"
          >
            保存
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
