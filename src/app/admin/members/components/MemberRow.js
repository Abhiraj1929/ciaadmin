import { memo } from "react";

const MemberRow = memo(function MemberRow({
  member,
  isSelected,
  onSelect,
  onDelete,
  deleteLoading,
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case "basic":
        return "bg-blue-100 text-blue-800";
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "unlimited":
        return "bg-gold-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {member.name?.charAt(0).toUpperCase() || "M"}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {member.name}
            </div>
            <div className="text-sm text-gray-500">
              ID: {member.id.slice(0, 8)}...
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{member.email}</div>
        {member.phone && (
          <div className="text-sm text-gray-500">{member.phone}</div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 capitalize">
          {member.role || "member"}
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            member.status
          )}`}
        >
          {member.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccessLevelColor(
            member.access_level
          )}`}
        >
          {member.access_level || "basic"}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(member.created_at).toLocaleDateString()}
        <br />
        <span className="text-xs">
          {new Date(member.created_at).toLocaleTimeString()}
        </span>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={onDelete}
          disabled={deleteLoading}
          className="text-red-600 hover:text-red-800 disabled:opacity-50"
          title="Delete member"
        >
          🗑️
        </button>
      </td>
    </tr>
  );
});

export default MemberRow;
