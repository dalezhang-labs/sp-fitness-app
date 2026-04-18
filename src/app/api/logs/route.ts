import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/logs?date=2026-04-17  或  GET /api/logs (全部)
export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const date = req.nextUrl.searchParams.get("date");

    const rows = date
      ? await sql`SELECT * FROM workout_logs WHERE log_date = ${date} ORDER BY completed_at`
      : await sql`SELECT * FROM workout_logs ORDER BY completed_at DESC LIMIT 500`;

    // 按日期分组，返回 DayLog[] 格式
    const logMap: Record<string, { date: string; completedExercises: object[] }> = {};
    for (const r of rows) {
      const d = r.log_date instanceof Date
        ? r.log_date.toISOString().slice(0, 10)
        : String(r.log_date);
      if (!logMap[d]) logMap[d] = { date: d, completedExercises: [] };
      logMap[d].completedExercises.push({
        exerciseId: r.exercise_id,
        exerciseName: r.exercise_name,
        bodyPart: r.body_part,
        completedSets: r.completed_sets,
        totalSets: r.total_sets,
        completedAt: r.completed_at,
      });
    }

    return NextResponse.json(Object.values(logMap));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

// POST /api/logs
export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { exerciseId, exerciseName, bodyPart, completedSets, totalSets, completedAt } = body;

    const completedAtDate = new Date(completedAt);
    const logDate = completedAtDate.toISOString().slice(0, 10);

    await sql`
      INSERT INTO workout_logs
        (exercise_id, exercise_name, body_part, completed_sets, total_sets, completed_at, log_date)
      VALUES
        (${exerciseId}, ${exerciseName}, ${bodyPart}, ${completedSets}, ${totalSets}, ${completedAt}, ${logDate})
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}
