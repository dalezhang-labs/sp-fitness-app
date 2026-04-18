import { Exercise, DayLog, CompletedExercise, BodyPart } from "./types";

const REST_KEY = "sp-fitness-rest";

// ---- Exercises（通过 API） ----
export async function getExercisesByPart(part: BodyPart): Promise<Exercise[]> {
  const res = await fetch(`/api/exercises?bodyPart=${part}`);
  if (!res.ok) throw new Error("Failed to fetch exercises");
  return res.json();
}

export async function saveExercise(exercise: Exercise): Promise<void> {
  const res = await fetch("/api/exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(exercise),
  });
  if (!res.ok) throw new Error("Failed to save exercise");
}

export async function deleteExercise(id: string): Promise<void> {
  const res = await fetch(`/api/exercises/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete exercise");
}

// ---- Logs（通过 API） ----
export async function getDayLog(date: string): Promise<DayLog> {
  const res = await fetch(`/api/logs?date=${date}`);
  if (!res.ok) throw new Error("Failed to fetch day log");
  const logs: DayLog[] = await res.json();
  return logs[0] || { date, completedExercises: [] };
}

export async function getAllLogs(): Promise<DayLog[]> {
  const res = await fetch("/api/logs");
  if (!res.ok) throw new Error("Failed to fetch logs");
  return res.json();
}

export async function saveCompletedExercise(
  _date: string,
  entry: CompletedExercise
): Promise<void> {
  const res = await fetch("/api/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("Failed to save log");
}

// ---- 组间休息设置（保留 localStorage，纯本地偏好） ----
export function getDefaultRest(): number {
  if (typeof window === "undefined") return 60;
  const raw = localStorage.getItem(REST_KEY);
  return raw ? parseInt(raw, 10) : 60;
}

export function setDefaultRest(seconds: number): void {
  localStorage.setItem(REST_KEY, String(seconds));
}
