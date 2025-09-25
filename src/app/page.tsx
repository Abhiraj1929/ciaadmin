import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 py-8">
      <div className="text-center space-y-6 sm:space-y-8 max-w-md sm:max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl sm:text-4xl">🕵️</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
            CIA AGENTS
          </h1>
          <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Subtitle */}
        <p className="text-gray-300 text-sm sm:text-base max-w-xs sm:max-w-md mx-auto leading-relaxed">
          Secure Agent Management Portal
        </p>

        {/* Login Buttons */}
        <div className="space-y-4 pt-6 sm:pt-8">
          <h2 className="text-lg sm:text-xl text-white font-medium mb-4 sm:mb-6">
            Choose Access Level
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {/* Admin Login Button */}
            <Link
              href="/admin/login"
              className="block w-full max-w-xs mx-auto px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <div className="flex items-center justify-center space-x-3">
                <span className="text-xl">🔐</span>
                <div>
                  <div className="text-base font-semibold">Admin Access</div>
                  <div className="text-xs opacity-90">System Control</div>
                </div>
              </div>
            </Link>

            {/* Member Login Button */}
            <Link
              href="/member/login"
              className="block w-full max-w-xs mx-auto px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <div className="flex items-center justify-center space-x-3">
                <span className="text-xl">👤</span>
                <div>
                  <div className="text-base font-semibold">Agent Access</div>
                  <div className="text-xs opacity-90">Member Portal</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Security Badge */}
        <div className="pt-6 sm:pt-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg text-gray-300 text-xs sm:text-sm">
            <span className="text-yellow-400">🔒</span>
            <span>Secured Access System</span>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-6 sm:pt-8 text-gray-400 text-xs sm:text-sm">
          <p>&copy; 2025 CiaLabs. All rights reserved.</p>
        </footer>
      </div>

      {/* Minimal Background Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-32 sm:w-48 h-32 sm:h-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-40 sm:w-60 h-40 sm:h-60 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
    </div>
  );
}
