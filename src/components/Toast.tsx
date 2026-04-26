"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
// Global listeners so any module can trigger a toast
const listeners = new Set<(item: ToastItem) => void>();

/** Fire a toast from anywhere (no hook needed) */
export function toast(message: string, type: ToastType = "info") {
  const item: ToastItem = { id: ++toastId, message, type };
  listeners.forEach((fn) => fn(item));
}

/** Render this once in your layout / page root */
export default function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  useEffect(() => {
    const handler = (item: ToastItem) => {
      setItems((prev) => [...prev.slice(-4), item]); // keep max 5
      const timer = setTimeout(() => remove(item.id), 3000);
      timers.current.set(item.id, timer);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, [remove]);

  if (items.length === 0) return null;

  const colors: Record<ToastType, { bg: string; border: string; text: string }> = {
    success: { bg: "var(--success-light)", border: "var(--success)", text: "var(--success-dark)" },
    error:   { bg: "var(--error-light)",   border: "var(--error)",   text: "var(--error)" },
    info:    { bg: "var(--brand-100)",     border: "var(--brand-400)", text: "var(--brand-700)" },
  };

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {items.map((item) => {
        const c = colors[item.type];
        return (
          <div
            key={item.id}
            className="pointer-events-auto px-4 py-2.5 rounded-xl text-sm font-medium shadow-md animate-slide-in"
            style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              color: c.text,
              minWidth: "200px",
              textAlign: "center",
            }}
            role="alert"
            onClick={() => remove(item.id)}
          >
            {item.message}
          </div>
        );
      })}
    </div>
  );
}
