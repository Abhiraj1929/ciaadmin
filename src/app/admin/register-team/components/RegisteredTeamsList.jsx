import TeamCard from "./TeamCard";

export default function RegisteredTeamsList({
  registeredTeams,
  loadingTeams,
  selectedEventDetails,
  onTeamDeleted,
  showMessage
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registered Teams</h2>
          {selectedEventDetails && (
            <p className="text-gray-600 mt-1">
              Event: {selectedEventDetails.name}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Teams</p>
          <p className="text-2xl font-bold text-blue-600">
            {registeredTeams.length}
          </p>
        </div>
      </div>

      {loadingTeams ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading teams...</span>
        </div>
      ) : registeredTeams.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <p className="text-gray-500 text-lg">No teams registered yet</p>
          <p className="text-gray-400 text-sm">
            Be the first team to register for this event!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {registeredTeams.map((team) => (
            <TeamCard 
              key={team.id} 
              team={team} 
              onTeamDeleted={onTeamDeleted}
              showMessage={showMessage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
