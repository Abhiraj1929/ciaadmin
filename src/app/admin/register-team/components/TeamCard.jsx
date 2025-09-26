export default function TeamCard({ team, onTeamDeleted, showMessage }) {
  const handleDeleteTeam = async () => {
    // Show immediate feedback
    showMessage("Deleting team...", "info");
    
    try {
      const response = await fetch('/api/delete-team', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId: team.id })
      });

      if (response.ok) {
        showMessage(`Team "${team.team_name}" deleted successfully!`, 'success');
        onTeamDeleted(team.id);
      } else {
        showMessage("Failed to delete team", 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showMessage("Failed to delete team", 'error');
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {team.team_name}
          </h3>
          <p className="text-sm text-gray-500">
            Registered on:{" "}
            {new Date(team.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {team.team_size} member{team.team_size !== 1 ? "s" : ""}
          </span>
          <button
            onClick={handleDeleteTeam}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors duration-200"
            title="Delete Team"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Team Members Display */}
      <div className="border-t border-gray-100 pt-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Team Members:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {team.participants
            ?.sort((a, b) => a.position_in_team - b.position_in_team)
            .map((participant) => (
              <div
                key={participant.id}
                className="bg-gray-50 rounded-lg p-3"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 rounded-full px-2 py-1">
                    #{participant.position_in_team}
                  </span>
                  <span className="font-medium text-gray-900">
                    {participant.name}
                  </span>
                </div>
                {participant.email && (
                  <p className="text-xs text-gray-600 truncate">
                    📧 {participant.email}
                  </p>
                )}
                {participant.phone && (
                  <p className="text-xs text-gray-600">
                    📱 {participant.phone}
                  </p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
