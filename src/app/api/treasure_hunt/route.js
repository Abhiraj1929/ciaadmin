import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("game_id");

    let query = supabase.from("treasure_hunt").select("*");

    if (gameId) {
      query = query.eq("game_id", gameId);
    }

    const { data, error } = await query.order("order_index", {
      ascending: true,
    });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("treasure_hunt")
      .insert([body])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
