import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date)
    return NextResponse.json({ error: "date is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("attendance_50days")
    .select("student_id, present")
    .eq("date", date);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attendance: data || [] });
}

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });
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

  const { error } = await supabase
    .from("attendance_50days")
    .upsert(payload, { onConflict: "student_id,date" });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
