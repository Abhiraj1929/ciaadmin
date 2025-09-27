import { memo } from "react";

const Pagination = memo(function Pagination({
  pagination,
  onPaginationChange,
}) {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (totalPages <= 1) return null;

  return (
    <div className="bg-white px-4 py-3 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() =>
              onPaginationChange({ ...pagination, page: pagination.page - 1 })
            }
            disabled={pagination.page === 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>

          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (pagination.page <= 3) {
              pageNum = i + 1;
            } else if (pagination.page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = pagination.page - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() =>
                  onPaginationChange({ ...pagination, page: pageNum })
                }
                className={`px-3 py-1 border rounded text-sm ${
                  pagination.page === pageNum
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() =>
              onPaginationChange({ ...pagination, page: pagination.page + 1 })
            }
            disabled={pagination.page === totalPages}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
});

export default Pagination;
