export default function ParticipantCard({
  participant,
  index,
  onUpdate,
  onRemove,
  canRemove,
  isRequired,
}) {
  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-800">
          Member {index + 1}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name {isRequired ? "*" : ""}
          </label>
          <input
            type="text"
            value={participant.name}
            onChange={(e) => onUpdate(index, "name", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Full name"
            required={isRequired}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={participant.email}
            onChange={(e) => onUpdate(index, "email", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={participant.phone}
            onChange={(e) => onUpdate(index, "phone", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Phone number"
          />
        </div>
      </div>
    </div>
  );
}
