import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Member ID is required",
        },
        { status: 400 }
      );
    }

    const { data: member, error } = await supabase
      .from("members")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !member) {
      return NextResponse.json(
        {
          success: false,
          error: "Member not found",
        },
        { status: 404 }
      );
    }

    // Remove password hash from response
    const { password_hash, ...memberData } = member;

    return NextResponse.json({
      success: true,
      data: memberData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      { status: 500 }
    );
  }
}
