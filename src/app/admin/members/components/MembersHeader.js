import Link from "next/link";

export default function MembersHeader({ totalMembers, onRefresh, loading }) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Members Management</h1>
        <p className="text-gray-600 mt-1">{totalMembers} total members</p>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          🔄 Refresh
        </button>
        <Link
          href="/admin/members/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          ➕ Add Member
        </Link>
      </div>
    </div>
  );
}
