import { Exercise, DayLog, CompletedExercise, BodyPart } from "./types";

const EXERCISES_KEY = "sp-fitness-exercises";
const LOGS_KEY = "sp-fitness-logs";
const REST_KEY = "sp-fitness-rest";

// ---- 默认训练动作 ----
const DEFAULT_EXERCISES: Exercise[] = [
  // 手臂
  { id: "arm-1", name: "哑铃弯举", bodyPart: "arms", sets: 4, reps: 12, restSeconds: 60 },
  { id: "arm-2", name: "锤式弯举", bodyPart: "arms", sets: 4, reps: 12, restSeconds: 60 },
  { id: "arm-3", name: "窄距俯卧撑", bodyPart: "arms", sets: 4, reps: 15, restSeconds: 60 },
  { id: "arm-4", name: "三头臂屈伸", bodyPart: "arms", sets: 4, reps: 12, restSeconds: 60 },
  // 肩部
  { id: "sho-1", name: "哑铃推举", bodyPart: "shoulders", sets: 4, reps: 10, restSeconds: 60 },
  { id: "sho-2", name: "侧平举", bodyPart: "shoulders", sets: 4, reps: 15, restSeconds: 60 },
  { id: "sho-3", name: "前平举", bodyPart: "shoulders", sets: 3, reps: 12, restSeconds: 60 },
  { id: "sho-4", name: "俯身飞鸟", bodyPart: "shoulders", sets: 4, reps: 12, restSeconds: 60 },
  // 腹部
  { id: "abs-1", name: "卷腹", bodyPart: "abs", sets: 4, reps: 20, restSeconds: 45 },
  { id: "abs-2", name: "平板支撑", bodyPart: "abs", sets: 4, reps: 30, restSeconds: 60 },
  { id: "abs-3", name: "俄罗斯转体", bodyPart: "abs", sets: 4, reps: 20, restSeconds: 45 },
  { id: "abs-4", name: "抬腿", bodyPart: "abs", sets: 4, reps: 15, restSeconds: 60 },
];

// ---- Exercises CRUD ----
export function getExercises(): Exercise[] {
  if (typeof window === "undefined") return DEFAULT_EXERCISES;
  const raw = localStorage.getItem(EXERCISES_KEY);
  if (!raw) {
    localStorage.setItem(EXERCISES_KEY, JSON.stringify(DEFAULT_EXERCISES));
    return DEFAULT_EXERCISES;
  }
  return JSON.parse(raw);
}

export function getExercisesByPart(part: BodyPart): Exercise[] {
  return getExercises().filter((e) => e.bodyPart === part);
}

export function saveExercise(exercise: Exercise): void {
  const all = getExercises();
  const idx = all.findIndex((e) => e.id === exercise.id);
  if (idx >= 0) {
    all[idx] = exercise;
  } else {
    all.push(exercise);
  }
  localStorage.setItem(EXERCISES_KEY, JSON.stringify(all));
}

export function deleteExercise(id: string): void {
  const all = getExercises().filter((e) => e.id !== id);
  localStorage.setItem(EXERCISES_KEY, JSON.stringify(all));
}

// ---- Day Logs ----
export function getDayLog(date: string): DayLog {
  if (typeof window === "undefined") return { date, completedExercises: [] };
  const all = getAllLogs();
  return all.find((l) => l.date === date) || { date, completedExercises: [] };
}

export function getAllLogs(): DayLog[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LOGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveCompletedExercise(date: string, entry: CompletedExercise): void {
  const all = getAllLogs();
  let dayLog = all.find((l) => l.date === date);
  if (!dayLog) {
    dayLog = { date, completedExercises: [] };
    all.push(dayLog);
  }
  dayLog.completedExercises.push(entry);
  localStorage.setItem(LOGS_KEY, JSON.stringify(all));
}

// ---- Global rest setting ----
export function getDefaultRest(): number {
  if (typeof window === "undefined") return 60;
  const raw = localStorage.getItem(REST_KEY);
  return raw ? parseInt(raw, 10) : 60;
}

export function setDefaultRest(seconds: number): void {
  localStorage.setItem(REST_KEY, String(seconds));
}
