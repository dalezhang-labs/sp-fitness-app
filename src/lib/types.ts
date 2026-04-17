// 身体部位
export type BodyPart = "arms" | "shoulders" | "abs";

export const BODY_PARTS: Record<BodyPart, { label: string; emoji: string; description: string }> = {
  arms: { label: "手臂", emoji: "💪", description: "大臂增粗训练" },
  shoulders: { label: "肩部", emoji: "🏋️", description: "肩部变宽训练" },
  abs: { label: "腹部", emoji: "🔥", description: "减脂练腹肌" },
};

// 训练动作模板
export interface Exercise {
  id: string;
  name: string;
  bodyPart: BodyPart;
  sets: number;        // 组数
  reps: number;        // 每组次数
  restSeconds: number; // 组间休息秒数
}

// 单日训练记录
export interface DayLog {
  date: string; // YYYY-MM-DD
  completedExercises: CompletedExercise[];
}

export interface CompletedExercise {
  exerciseId: string;
  exerciseName: string;
  bodyPart: BodyPart;
  completedSets: number;
  totalSets: number;
  completedAt: string; // ISO timestamp
}

// 训练进行中的状态
export type TimerPhase = "idle" | "exercising" | "resting" | "done";
