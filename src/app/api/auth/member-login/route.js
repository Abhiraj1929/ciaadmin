import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 }
      );
    }

    console.log("Login attempt for:", email);

    // Get member by email
    const { data: member, error } = await supabase
      .from("members")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();

    console.log("Member query result:", {
      found: !!member,
      error: error?.message,
    });

    if (error || !member) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // For now, check if member exists and is active (password check will be added later)
    if (member.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: `Account is ${member.status}. Please contact admin.`,
        },
        { status: 403 }
      );
    }

    // Remove password hash from response
    const { password_hash, ...memberData } = member;

    console.log("Login successful for:", memberData.email);

    return NextResponse.json({
      success: true,
      data: memberData,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Member login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Server error: " + error.message,
      },
      { status: 500 }
    );
  }
}
