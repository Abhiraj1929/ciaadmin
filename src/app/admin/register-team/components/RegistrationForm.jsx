"use client";
import { useState } from "react";
import ParticipantCard from "./ParticipantCard";

export default function RegistrationForm({
  events,
  selectedEvent,
  setSelectedEvent,
  onRegistrationSuccess,
  showMessage,
}) {
  const [teamName, setTeamName] = useState("");
  const [participants, setParticipants] = useState([
    { name: "", email: "", phone: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const addParticipant = () => {
    if (participants.length < 5) {
      setParticipants([...participants, { name: "", email: "", phone: "" }]);
    }
  };

  const removeParticipant = (index) => {
    if (participants.length > 1) {
      const newParticipants = participants.filter((_, i) => i !== index);
      setParticipants(newParticipants);
    }
  };

  const updateParticipant = (index, field, value) => {
    const newParticipants = participants.map((participant, i) =>
      i === index ? { ...participant, [field]: value } : participant
    );
    setParticipants(newParticipants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedEvent || !teamName.trim()) {
        throw new Error("Please select an event and enter team name");
      }

      const validParticipants = participants.filter((p) => p.name.trim());
      if (validParticipants.length === 0) {
        throw new Error("At least one participant name is required");
      }

      const response = await fetch("/api/register-team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: selectedEvent,
          teamName: teamName.trim(),
          participants: validParticipants,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      showMessage("Team registered successfully!", "success");

      // Reset form
      setTeamName("");
      setParticipants([{ name: "", email: "", phone: "" }]);

      // Refresh teams list
      onRegistrationSuccess();
    } catch (error) {
      console.error("Registration error:", error);
      showMessage(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Register Event Team
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Selection */}
        <div>
          <label
            htmlFor="event"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Event *
          </label>
          <select
            id="event"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Choose an event...</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} (Max team size: {event.max_team_size})
              </option>
            ))}
          </select>
        </div>

        {/* Team Name */}
        <div>
          <label
            htmlFor="teamName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Team Name *
          </label>
          <input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your team name"
            required
          />
        </div>

        {/* Team Members */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Team Members
            </h2>
            <span className="text-sm text-gray-500">
              {participants.length}/5 members
            </span>
          </div>

          {participants.map((participant, participantIndex) => (
            <ParticipantCard
              key={participantIndex}
              participant={participant}
              index={participantIndex}
              onUpdate={updateParticipant}
              onRemove={removeParticipant}
              canRemove={participants.length > 1}
              isRequired={participantIndex === 0}
            />
          ))}

          {/* Add Member Button */}
          {participants.length < 5 && (
            <button
              type="button"
              onClick={addParticipant}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors duration-200"
            >
              + Add Team Member ({participants.length}/5)
            </button>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-colors duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Registering Team..." : "Register Team"}
          </button>
        </div>
      </form>
    </div>
  );
}
