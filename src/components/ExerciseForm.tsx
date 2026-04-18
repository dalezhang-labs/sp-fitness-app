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

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "var(--radius-md)",
  border: "1.5px solid var(--border)",
  background: "var(--surface-base)",
  color: "var(--text-primary)",
  fontSize: "0.875rem",
  outline: "none",
  transition: `border-color var(--duration-fast)`,
};

export default function ExerciseForm({ bodyPart, existing, onSave, onCancel }: ExerciseFormProps) {
  const [name, setName] = useState(existing?.name || "");
  const [sets, setSets] = useState(existing?.sets || 4);
  const [reps, setReps] = useState(existing?.reps || 12);
  const [restSeconds, setRestSeconds] = useState(existing?.restSeconds || 60);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ id: existing?.id || generateId(), name: name.trim(), bodyPart, sets, reps, restSeconds });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "oklch(0% 0 0 / 0.5)", backdropFilter: "blur(6px)" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{
          background: "var(--surface-raised)",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--border)",
        }}
      >
        <h3
          className="text-base font-semibold mb-5"
          style={{ color: "var(--text-primary)" }}
        >
          {existing ? "编辑训练动作" : "添加训练动作"}
        </h3>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              动作名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：哑铃弯举"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--brand-500)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              autoFocus
            />
          </div>

          {/* Sets / Reps / Rest */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "组数", value: sets, onChange: setSets, min: 1, max: 20 },
              { label: "每组次数", value: reps, onChange: setReps, min: 1, max: 100 },
              { label: "休息(秒)", value: restSeconds, onChange: setRestSeconds, min: 10, max: 300, step: 5 },
            ].map(({ label, value, onChange, min, max, step }) => (
              <div key={label}>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {label}
                </label>
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => onChange(Number(e.target.value))}
                  style={{ ...inputStyle, textAlign: "center" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--brand-500)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--brand-500)", color: "white" }}
          >
            保存
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: "var(--surface-base)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
