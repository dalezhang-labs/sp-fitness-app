import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/exercises?bodyPart=arms
export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const bodyPart = req.nextUrl.searchParams.get("bodyPart");

    const rows = bodyPart
      ? await sql`SELECT * FROM exercises WHERE body_part = ${bodyPart} ORDER BY created_at`
      : await sql`SELECT * FROM exercises ORDER BY body_part, created_at`;

    // 转换字段名为 camelCase
    const exercises = rows.map((r) => ({
      id: r.id,
      name: r.name,
      bodyPart: r.body_part,
      sets: r.sets,
      reps: r.reps,
      restSeconds: r.rest_seconds,
    }));

    return NextResponse.json(exercises);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
  }
}

// POST /api/exercises
export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { id, name, bodyPart, sets, reps, restSeconds } = body;

    await sql`
      INSERT INTO exercises (id, name, body_part, sets, reps, rest_seconds, updated_at)
      VALUES (${id}, ${name}, ${bodyPart}, ${sets}, ${reps}, ${restSeconds}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name         = EXCLUDED.name,
        body_part    = EXCLUDED.body_part,
        sets         = EXCLUDED.sets,
        reps         = EXCLUDED.reps,
        rest_seconds = EXCLUDED.rest_seconds,
        updated_at   = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save exercise" }, { status: 500 });
  }
}
