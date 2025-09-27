import { memo } from "react";

const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-gray-600">Loading members...</p>
    </div>
  );
});

export default LoadingSpinner;
