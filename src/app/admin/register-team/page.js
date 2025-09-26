"use client";
import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import RegistrationForm from "./components/RegistrationForm";
import RegisteredTeamsList from "./components/RegisteredTeamsList";

export default function RegisterTeam() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const supabase = createClientComponentClient();

  const showMessage = useCallback((text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, name, description, max_team_size, registration_deadline")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      showMessage("Failed to load events", "error");
    }
  }, [supabase, showMessage]);

  const fetchRegisteredTeams = useCallback(async () => {
    if (!selectedEvent) return;

    setLoadingTeams(true);
    try {
      const { data, error } = await supabase
        .from("teams")
        .select(
          `
          id,
          team_name,
          team_size,
          created_at,
          participants (
            id,
            name,
            email,
            phone,
            position_in_team
          )
        `
        )
        .eq("event_id", selectedEvent)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegisteredTeams(data || []);
    } catch (error) {
      console.error("Error fetching registered teams:", error);
      showMessage("Failed to load registered teams", "error");
    } finally {
      setLoadingTeams(false);
    }
  }, [selectedEvent, supabase, showMessage]);

  const handleTeamDeleted = useCallback((teamId) => {
    setRegisteredTeams((prev) => prev.filter((team) => team.id !== teamId));
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (selectedEvent) {
      fetchRegisteredTeams();
      setSelectedEventDetails(events.find((e) => e.id === selectedEvent));
    } else {
      setRegisteredTeams([]);
      setSelectedEventDetails(null);
    }
  }, [selectedEvent, events, fetchRegisteredTeams]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Global Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            messageType === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : messageType === "info"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Registration Form */}
      <RegistrationForm
        events={events}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        onRegistrationSuccess={fetchRegisteredTeams}
        showMessage={showMessage}
      />

      {/* Registered Teams List */}
      {selectedEvent && (
        <RegisteredTeamsList
          registeredTeams={registeredTeams}
          loadingTeams={loadingTeams}
          selectedEventDetails={selectedEventDetails}
          onTeamDeleted={handleTeamDeleted}
          showMessage={showMessage}
        />
      )}
    </div>
  );
}
