import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase
    .from("students_50days")
    .select("id, name, usn, current_streak, highest_streak")
    .order("name", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ students: data || [] });
}

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();
  const name = (body?.name || "").trim();
  const usn = (body?.usn || "").trim().toUpperCase();

  if (!name || !usn) {
    return NextResponse.json(
      { error: "Name and USN are required." },
      { status: 400 }
    );
  }
  if (!/^[A-Z0-9]+$/.test(usn)) {
    return NextResponse.json(
      { error: "USN must be alphanumeric." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("students_50days")
    .insert([{ name, usn }])
    .select("id, name, usn, current_streak, highest_streak")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ student: data }, { status: 201 });
}
