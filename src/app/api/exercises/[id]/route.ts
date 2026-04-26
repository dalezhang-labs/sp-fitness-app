import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// DELETE /api/exercises/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;
    await sql`DELETE FROM fitness.exercises WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete exercise" }, { status: 500 });
  }
}
