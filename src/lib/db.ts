import { neon } from "@neondatabase/serverless";

// 每次调用都创建连接（适合 serverless 环境）
export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(process.env.DATABASE_URL);
}
