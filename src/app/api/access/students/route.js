import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAccess } from "../_utils";

export async function GET(req) {
  const gate = await requireAccess(req, ["students:read"]);
  if (gate.error) return gate.error;

  const { data, error } = await supabaseAdmin
    .from("students_50days")
    .select("id, name, usn, current_streak, highest_streak")
    .order("name", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ students: data || [] });
}

export async function POST(req) {
  const gate = await requireAccess(req, ["students:write"]);
  if (gate.error) return gate.error;

  const { name, usn } = await req.json();
  const n = (name || "").trim();
  const u = (usn || "").trim().toUpperCase();

  if (!n || !u)
    return NextResponse.json(
      { error: "Name and USN required" },
      { status: 400 }
    );
  if (!/^[A-Z0-9]+$/.test(u))
    return NextResponse.json(
      { error: "USN must be alphanumeric" },
      { status: 400 }
    );

  const { data, error } = await supabaseAdmin
    .from("students_50days")
    .insert([{ name: n, usn: u }])
    .select("id, name, usn, current_streak, highest_streak")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ student: data }, { status: 201 });
}
