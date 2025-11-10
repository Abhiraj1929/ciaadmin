import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-50">
      <div className="w-full max-w-md mx-auto text-center space-y-10 bg-white/70 rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 bg-white flex items-center justify-center rounded-full border border-gray-300 shadow-sm">
            <span className="text-2xl" role="img" aria-label="detective">
              🕵️
            </span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">CIA Labs</h1>
          <p className="text-gray-500 text-sm font-medium">
            Admin Portal
          </p>
        </div>

        {/* Admin Login Button */}
        <Link
          href="/admin/login"
          className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-900 text-white font-medium rounded-lg shadow hover:bg-gray-800 transition-all duration-150"
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-base" role="img" aria-label="lock">
              🔐
            </span>
            <span>Admin Login</span>
          </div>
        </Link>


        {/* Footer */}
        <footer className="pt-4 text-gray-400 text-xs">
          <p>&copy; 2025 CIA Labs. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
