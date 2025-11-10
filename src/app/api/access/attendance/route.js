import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAccess } from "../_utils";

export async function GET(req) {
  const gate = await requireAccess(req, ["attendance:read"]);
  if (gate.error) return gate.error;

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date)
    return NextResponse.json({ error: "date is required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("attendance_50days")
    .select("student_id, present")
    .eq("date", date);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attendance: data || [] });
}

export async function POST(req) {
  const gate = await requireAccess(req, ["attendance:write"]);
  if (gate.error) return gate.error;

  const body = await req.json();
  const date = body?.date;
  const rows = Array.isArray(body?.rows) ? body.rows : [];
  if (!date || rows.length === 0) {
    return NextResponse.json(
      { error: "date and rows are required" },
      { status: 400 }
    );
  }

  const payload = rows.map((r) => ({
    student_id: Number(r.student_id),
    date,
    present: !!r.present,
  }));

  const { error } = await supabaseAdmin
    .from("attendance_50days")
    .upsert(payload, { onConflict: "student_id,date" });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
