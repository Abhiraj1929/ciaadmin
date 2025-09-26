import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { teamId } = await request.json();

    if (!teamId) {
      return NextResponse.json({ error: "Team ID required" }, { status: 400 });
    }

    // Delete the team (CASCADE will delete participants automatically)
    const { error } = await supabase.from("teams").delete().eq("id", teamId);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
