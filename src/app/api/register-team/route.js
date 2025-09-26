import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { eventId, teamName, participants } = await request.json();

    // Validate input
    if (!eventId || !teamName || !participants || participants.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (participants.length > 5) {
      return NextResponse.json(
        { error: "Team size cannot exceed 5 members" },
        { status: 400 }
      );
    }

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, name, max_team_size")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert([
        {
          event_id: eventId,
          team_name: teamName,
          team_size: participants.length,
        },
      ])
      .select()
      .single();

    if (teamError) {
      return NextResponse.json(
        { error: "Failed to create team" },
        { status: 500 }
      );
    }

    // Create participants
    const participantData = participants.map((participant, index) => ({
      team_id: team.id,
      name: participant.name,
      email: participant.email || null,
      phone: participant.phone || null,
      position_in_team: index + 1,
    }));

    const { data: createdParticipants, error: participantError } =
      await supabase.from("participants").insert(participantData).select();

    if (participantError) {
      // Rollback team creation
      await supabase.from("teams").delete().eq("id", team.id);
      return NextResponse.json(
        { error: "Failed to register participants" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        team: team,
        participants: createdParticipants,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
