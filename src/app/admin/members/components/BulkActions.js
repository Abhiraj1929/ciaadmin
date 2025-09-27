import { memo } from "react";

const BulkActions = memo(function BulkActions({
  selectedMembers,
  onBulkDelete,
  deleteLoading,
}) {
  if (selectedMembers.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-red-800 font-medium">
          {selectedMembers.length} members selected
        </span>
        <button
          onClick={onBulkDelete}
          disabled={deleteLoading}
          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
        >
          {deleteLoading ? "Deleting..." : "🗑️ Delete Selected"}
        </button>
      </div>
    </div>
  );
});

export default BulkActions;
