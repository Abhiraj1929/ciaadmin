import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET method for fetching members
export async function GET(request) {
  try {
    console.log("GET /api/members called");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    console.log("Query params:", { page, limit, status, search });

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("members")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status
    if (
      status !== "all" &&
      ["active", "pending", "inactive"].includes(status)
    ) {
      query = query.eq("status", status);
    }

    // Search by name or email
    if (search.trim()) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    console.log("Executing query...");
    const { data, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Database error: " + error.message,
          debug: error,
        },
        { status: 500 }
      );
    }

    console.log(`Query successful: ${data?.length || 0} members found`);

    return NextResponse.json(
      {
        success: true,
        data: {
          members: data || [],
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
        error: "Server error: " + error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

// DELETE method for deleting members
export async function DELETE(request) {
  try {
    console.log("DELETE /api/members called");

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

    console.log("Deleting member with ID:", id);

    // Delete the member
    const { error: memberError } = await supabase
      .from("members")
      .delete()
      .eq("id", id);

    if (memberError) {
      console.error("Error deleting member:", memberError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete member: " + memberError.message,
        },
        { status: 500 }
      );
    }

    console.log("Member deleted successfully");

    return NextResponse.json(
      {
        success: true,
        message: "Member deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Server error: " + error.message,
      },
      { status: 500 }
    );
  }
}
