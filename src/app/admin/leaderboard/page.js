"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState, useCallback } from "react";

const LeaderboardManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState(new Set());
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [bulkData, setBulkData] = useState({ points: "", matches: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, eliminated

  const supabase = createClientComponentClient();

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("teams")
        .select(
          `
          id,
          team_name,
          team_size,
          created_at,
          participants (
            name
          ),
          leaderboard (
            matches_played,
            points,
            eliminated
          )
        `
        )
        .order("team_name");

      if (error) throw error;

      const transformedTeams =
        data?.map((team) => ({
          id: team.id,
          team_name: team.team_name,
          team_size: team.team_size,
          created_at: team.created_at,
          participants: team.participants || [],
          matches_played: team.leaderboard?.[0]?.matches_played || 0,
          points: team.leaderboard?.[0]?.points || 0,
          eliminated: team.leaderboard?.[0]?.eliminated || false,
          hasLeaderboardEntry: team.leaderboard && team.leaderboard.length > 0,
        })) || [];

      setTeams(transformedTeams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      alert("Error loading teams: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTeams();

    // Real-time subscriptions
    const teamsChannel = supabase
      .channel("admin-teams-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        fetchTeams
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard" },
        fetchTeams
      )
      .subscribe();

    return () => {
      supabase.removeChannel(teamsChannel);
    };
  }, [fetchTeams, supabase]);

  const updateTeamData = async (teamId, field, value) => {
    try {
      setUpdating(true);

      // Check if leaderboard entry exists
      const { data: existingEntry } = await supabase
        .from("leaderboard")
        .select("id")
        .eq("team_id", teamId)
        .single();

      const updateData = {
        [field]: field === "eliminated" ? value : parseInt(value) || 0,
      };

      if (existingEntry) {
        const { error } = await supabase
          .from("leaderboard")
          .update(updateData)
          .eq("team_id", teamId);

        if (error) throw error;
      } else {
        const newEntry = {
          team_id: teamId,
          matches_played: 0,
          points: 0,
          eliminated: false,
          ...updateData,
        };

        const { error } = await supabase.from("leaderboard").insert(newEntry);

        if (error) throw error;
      }

      // Update local state
      setTeams((prev) =>
        prev.map((team) =>
          team.id === teamId
            ? {
                ...team,
                [field]: field === "eliminated" ? value : parseInt(value) || 0,
                hasLeaderboardEntry: true,
              }
            : team
        )
      );

      return { success: true };
    } catch (error) {
      console.error("Update error:", error);
      alert("Update failed: " + error.message);
      return { success: false };
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkUpdate = async () => {
    try {
      setUpdating(true);

      const updates = Array.from(selectedTeams).map(async (teamId) => {
        const { data: existingEntry } = await supabase
          .from("leaderboard")
          .select("id")
          .eq("team_id", teamId)
          .single();

        const updateData = {
          points: parseInt(bulkData.points) || 0,
          matches_played: parseInt(bulkData.matches) || 0,
        };

        if (existingEntry) {
          return supabase
            .from("leaderboard")
            .update(updateData)
            .eq("team_id", teamId);
        } else {
          return supabase.from("leaderboard").insert({
            team_id: teamId,
            eliminated: false,
            ...updateData,
          });
        }
      });

      const results = await Promise.all(updates);

      if (results.some((result) => result.error)) {
        throw new Error("Some updates failed");
      }

      await fetchTeams();
      setSelectedTeams(new Set());
      setShowBulkUpdate(false);
      setBulkData({ points: "", matches: "" });
      alert("Bulk update completed successfully!");
    } catch (error) {
      console.error("Bulk update error:", error);
      alert("Bulk update failed: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const toggleTeamSelection = (teamId) => {
    const newSelected = new Set(selectedTeams);
    if (newSelected.has(teamId)) {
      newSelected.delete(teamId);
    } else {
      newSelected.add(teamId);
    }
    setSelectedTeams(newSelected);
  };

  const selectAllTeams = () => {
    if (selectedTeams.size === filteredTeams.length) {
      setSelectedTeams(new Set());
    } else {
      setSelectedTeams(new Set(filteredTeams.map((team) => team.id)));
    }
  };

  // Filter and search teams
  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.participants.some((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && !team.eliminated) ||
      (filter === "eliminated" && team.eliminated);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
        <span className="mt-3 text-sm sm:text-base text-gray-600 text-center">
          Loading teams...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header - Mobile Optimized */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              Leaderboard Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage team scores, matches, and eliminations
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
              {teams.length} Teams
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
              {teams.filter((t) => !t.eliminated).length} Active
            </span>
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">
              {teams.filter((t) => t.eliminated).length} Eliminated
            </span>
            {updating && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                <span className="text-xs">Updating...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls - Mobile Optimized */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="space-y-4">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search teams or participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
            >
              <option value="all">All Teams</option>
              <option value="active">Active</option>
              <option value="eliminated">Eliminated</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedTeams.size > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm text-blue-800 font-medium">
                {selectedTeams.size} team{selectedTeams.size !== 1 ? "s" : ""}{" "}
                selected
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowBulkUpdate(!showBulkUpdate)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Bulk Update
                </button>
                <button
                  onClick={() => setSelectedTeams(new Set())}
                  className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Bulk Update Form */}
          {showBulkUpdate && selectedTeams.size > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
                Update {selectedTeams.size} selected teams
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    placeholder="Enter points"
                    value={bulkData.points}
                    onChange={(e) =>
                      setBulkData((prev) => ({
                        ...prev,
                        points: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Matches
                  </label>
                  <input
                    type="number"
                    placeholder="Enter matches"
                    value={bulkData.matches}
                    onChange={(e) =>
                      setBulkData((prev) => ({
                        ...prev,
                        matches: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-2 flex items-end gap-2">
                  <button
                    onClick={handleBulkUpdate}
                    disabled={updating}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    Apply Updates
                  </button>
                  <button
                    onClick={() => setShowBulkUpdate(false)}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Teams Content */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedTeams.size === filteredTeams.length &&
                      filteredTeams.length > 0
                    }
                    onChange={selectAllTeams}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matches
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeams.map((team) => (
                <TeamTableRow
                  key={team.id}
                  team={team}
                  isSelected={selectedTeams.has(team.id)}
                  onSelect={() => toggleTeamSelection(team.id)}
                  onUpdate={updateTeamData}
                  updating={updating}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - Visible only on mobile */}
        <div className="md:hidden">
          {filteredTeams.map((team) => (
            <TeamMobileCard
              key={team.id}
              team={team}
              isSelected={selectedTeams.has(team.id)}
              onSelect={() => toggleTeamSelection(team.id)}
              onUpdate={updateTeamData}
              updating={updating}
            />
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="text-4xl sm:text-6xl mb-4">🏆</div>
            <p className="text-gray-500 text-base sm:text-lg mb-2">
              No teams found
            </p>
            <p className="text-gray-400 text-sm">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No teams match the current filter"}
            </p>
          </div>
        )}
      </div>

      {/* Stats Summary - Mobile Optimized */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          Tournament Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {teams.reduce((sum, team) => sum + team.points, 0)}
            </div>
            <div className="text-xs sm:text-sm text-blue-600 mt-1">
              Total Points
            </div>
          </div>
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {teams.reduce((sum, team) => sum + team.matches_played, 0)}
            </div>
            <div className="text-xs sm:text-sm text-green-600 mt-1">
              Total Matches
            </div>
          </div>
          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">
              {
                teams.filter(
                  (team) => team.hasLeaderboardEntry && !team.eliminated
                ).length
              }
            </div>
            <div className="text-xs sm:text-sm text-purple-600 mt-1">
              Active Teams
            </div>
          </div>
          <div className="bg-red-50 p-3 sm:p-4 rounded-lg text-center">
            <div className="text-lg sm:text-2xl font-bold text-red-600">
              {teams.filter((team) => team.eliminated).length}
            </div>
            <div className="text-xs sm:text-sm text-red-600 mt-1">
              Eliminated
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Editable Cell Component - Mobile Optimized
const EditableCell = ({ value, onSave, type = "number", disabled = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await onSave(inputValue);
    setIsSaving(false);

    if (result?.success !== false) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setInputValue(value);
    setIsEditing(false);
  };

  if (disabled) {
    return <span className="text-gray-400 text-sm">{value}</span>;
  }

  if (isEditing) {
    return (
      <div className="flex items-center justify-center gap-1">
        <input
          type={type}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          className="w-14 sm:w-16 px-1 py-1 text-xs sm:text-sm border border-blue-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
          disabled={isSaving}
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="text-green-600 hover:text-green-800 p-0.5 text-sm"
        >
          {isSaving ? "⏳" : "✓"}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="text-red-600 hover:text-red-800 p-0.5 text-sm"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="px-2 py-1 text-xs sm:text-sm bg-gray-100 hover:bg-blue-100 rounded transition-colors font-medium min-w-[2rem] sm:min-w-[3rem]"
    >
      {value}
    </button>
  );
};

// Desktop Table Row Component
const TeamTableRow = ({ team, isSelected, onSelect, onUpdate, updating }) => {
  const formatParticipants = (participants) => {
    if (!participants || participants.length === 0) return "No participants";
    if (participants.length <= 2) {
      return participants.map((p) => p.name).join(", ");
    }
    return `${participants
      .slice(0, 2)
      .map((p) => p.name)
      .join(", ")} (+${participants.length - 2} more)`;
  };

  return (
    <tr
      className={`hover:bg-gray-50 ${isSelected ? "bg-blue-50" : ""} ${
        team.eliminated ? "opacity-60" : ""
      }`}
    >
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-4 w-4 text-blue-600 rounded"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center">
          <div>
            <div className="font-medium text-gray-900 text-sm">
              {team.team_name}
            </div>
            <div className="text-xs text-gray-500">Size: {team.team_size}</div>
          </div>
          {team.eliminated && (
            <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
              Eliminated
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-xs text-gray-600 max-w-xs">
          {formatParticipants(team.participants)}
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <EditableCell
          value={team.points}
          onSave={(value) => onUpdate(team.id, "points", value)}
          disabled={updating}
        />
      </td>
      <td className="px-4 py-3 text-center">
        <EditableCell
          value={team.matches_played}
          onSave={(value) => onUpdate(team.id, "matches_played", value)}
          disabled={updating}
        />
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            team.eliminated
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {team.eliminated ? "Eliminated" : "Active"}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onUpdate(team.id, "eliminated", !team.eliminated)}
          disabled={updating}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            team.eliminated
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          } disabled:opacity-50`}
        >
          {team.eliminated ? "Restore" : "Eliminate"}
        </button>
      </td>
    </tr>
  );
};

// Mobile Card Component - Fully Responsive
const TeamMobileCard = ({ team, isSelected, onSelect, onUpdate, updating }) => {
  const formatParticipants = (participants) => {
    if (!participants || participants.length === 0) return "No participants";
    return participants.map((p) => p.name).join(", ");
  };

  return (
    <div
      className={`p-4 border-b border-gray-200 last:border-b-0 ${
        isSelected ? "bg-blue-50" : ""
      } ${team.eliminated ? "opacity-70" : ""}`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="h-4 w-4 text-blue-600 rounded mt-0.5 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
                {team.team_name}
              </h3>
              <span
                className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${
                  team.eliminated
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {team.eliminated ? "Eliminated" : "Active"}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2 break-words">
              {formatParticipants(team.participants)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Team Size: {team.team_size}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-50 p-2 rounded text-center">
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
            Points
          </label>
          <EditableCell
            value={team.points}
            onSave={(value) => onUpdate(team.id, "points", value)}
            disabled={updating}
          />
        </div>
        <div className="bg-gray-50 p-2 rounded text-center">
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
            Matches
          </label>
          <EditableCell
            value={team.matches_played}
            onSave={(value) => onUpdate(team.id, "matches_played", value)}
            disabled={updating}
          />
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onUpdate(team.id, "eliminated", !team.eliminated)}
        disabled={updating}
        className={`w-full px-3 py-2 text-sm font-medium rounded transition-colors ${
          team.eliminated
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-red-100 text-red-800 hover:bg-red-200"
        } disabled:opacity-50`}
      >
        {team.eliminated ? "🔄 Restore Team" : "❌ Eliminate Team"}
      </button>
    </div>
  );
};

export default LeaderboardManagement;
