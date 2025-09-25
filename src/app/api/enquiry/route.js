import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const status = searchParams.get("status") || "all";

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build base query
    let query = supabase
      .from("contact_submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter if specified
    if (status !== "all" && ["unread", "read", "replied"].includes(status)) {
      query = query.eq("status", status);
    }

    // Execute query
    const { data, error, count } = await query;

    // Handle database errors
    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to retrieve submissions.",
        },
        { status: 500 }
      );
    }

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: {
          submissions: data || [],
          total: count || 0,
          page,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
