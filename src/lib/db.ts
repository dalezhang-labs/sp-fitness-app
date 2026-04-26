import { neon, NeonQueryFunction } from "@neondatabase/serverless";

// 每次调用都创建连接（适合 serverless 环境）
// Tables live under the "fitness" schema (shared Neon DB, per-project schema)
export function getDb(): NeonQueryFunction<false, false> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(process.env.DATABASE_URL);
}

/** Schema prefix for all fitness tables */
export const SCHEMA = "fitness";
