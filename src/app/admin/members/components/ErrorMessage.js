import { memo } from "react";

const ErrorMessage = memo(function ErrorMessage({ error, onRetry }) {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-red-500">❌</span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">Error Loading Members</h3>
          <div className="mt-2 text-sm">
            <p>{error}</p>
          </div>
          <div className="mt-4">
            <button
              onClick={onRetry}
              className="bg-red-100 px-3 py-2 rounded text-sm hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ErrorMessage;
