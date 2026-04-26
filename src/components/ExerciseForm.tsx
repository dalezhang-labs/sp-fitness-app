"use client";

import { useState, useEffect, useRef } from "react";
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

/** Clamp a numeric value to [min, max], fallback to defaultVal if NaN */
function clampNum(raw: number, min: number, max: number, defaultVal: number): number {
  if (!Number.isFinite(raw)) return defaultVal;
  return Math.max(min, Math.min(max, Math.round(raw)));
}

export default function ExerciseForm({ bodyPart, existing, onSave, onCancel }: ExerciseFormProps) {
  const [name, setName] = useState(existing?.name || "");
  const [sets, setSets] = useState(existing?.sets || 4);
  const [reps, setReps] = useState(existing?.reps || 12);
  const [restSeconds, setRestSeconds] = useState(existing?.restSeconds || 60);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // #4 fix: Esc to close + focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onCancel(); return; }
      // Focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'input, button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    // Auto-focus first input
    firstInputRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "请输入动作名称";
    if (!Number.isFinite(sets) || sets < 1 || sets > 20) errs.sets = "1-20";
    if (!Number.isFinite(reps) || reps < 1 || reps > 100) errs.reps = "1-100";
    if (!Number.isFinite(restSeconds) || restSeconds < 10 || restSeconds > 300) errs.rest = "10-300";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // #3 fix: clamp values before saving
    onSave({
      id: existing?.id || generateId(),
      name: name.trim(),
      bodyPart,
      sets: clampNum(sets, 1, 20, 4),
      reps: clampNum(reps, 1, 100, 12),
      restSeconds: clampNum(restSeconds, 10, 300, 60),
    });
  };

  const fields = [
    { label: "组数", value: sets, onChange: setSets, min: 1, max: 20, step: 1, errKey: "sets" },
    { label: "每组次数", value: reps, onChange: setReps, min: 1, max: 100, step: 1, errKey: "reps" },
    { label: "休息(秒)", value: restSeconds, onChange: setRestSeconds, min: 10, max: 300, step: 5, errKey: "rest" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "oklch(0% 0 0 / 0.5)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-label={existing ? "编辑训练动作" : "添加训练动作"}
    >
      <div ref={dialogRef}>
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
                ref={firstInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：哑铃弯举"
                style={{
                  ...inputStyle,
                  borderColor: errors.name ? "var(--error)" : undefined,
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--brand-500)")}
                onBlur={(e) => (e.target.style.borderColor = errors.name ? "var(--error)" : "var(--border)")}
              />
              {errors.name && (
                <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.name}</p>
              )}
            </div>

            {/* Sets / Reps / Rest — #3 fix: clamp + field-level errors */}
            <div className="grid grid-cols-3 gap-3">
              {fields.map(({ label, value, onChange, min, max, step, errKey }) => (
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
                    onChange={(e) => {
                      const raw = Number(e.target.value);
                      onChange(Number.isFinite(raw) ? raw : value);
                    }}
                    style={{
                      ...inputStyle,
                      textAlign: "center",
                      borderColor: errors[errKey] ? "var(--error)" : undefined,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--brand-500)")}
                    onBlur={(e) => (e.target.style.borderColor = errors[errKey] ? "var(--error)" : "var(--border)")}
                  />
                  {errors[errKey] && (
                    <p className="text-xs mt-1 text-center" style={{ color: "var(--error)" }}>{errors[errKey]}</p>
                  )}
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
    </div>
  );
}
