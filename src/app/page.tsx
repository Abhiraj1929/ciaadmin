import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="text-center space-y-6 sm:space-y-8 w-full max-w-md sm:max-w-lg lg:max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span
              className="text-2xl sm:text-3xl lg:text-4xl"
              role="img"
              aria-label="detective"
            >
              🕵️
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            CIA AGENTS
          </h1>
          <div className="w-12 sm:w-16 lg:w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full" />
        </div>

        {/* Subtitle */}
        <p className="text-gray-300 text-xs sm:text-sm md:text-base px-4 leading-relaxed">
          Secure Agent Management Portal
        </p>

        {/* Login Buttons */}
        <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
          <h2 className="text-base sm:text-lg md:text-xl text-white font-medium mb-3 sm:mb-4">
            Choose Access Level
          </h2>

          <div className="space-y-3 px-2 sm:px-0">
            {/* Admin Login Button */}
            <Link
              href="/admin/login"
              className="block w-full max-w-xs mx-auto px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <span
                  className="text-lg sm:text-xl"
                  role="img"
                  aria-label="lock"
                >
                  🔐
                </span>
                <div>
                  <div className="text-sm sm:text-base font-semibold">
                    Admin Access
                  </div>
                  <div className="text-xs opacity-90">System Control</div>
                </div>
              </div>
            </Link>

            {/* Member Login Button */}
            <Link
              href="/member/login"
              className="block w-full max-w-xs mx-auto px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <span
                  className="text-lg sm:text-xl"
                  role="img"
                  aria-label="user"
                >
                  👤
                </span>
                <div>
                  <div className="text-sm sm:text-base font-semibold">
                    Agent Access
                  </div>
                  <div className="text-xs opacity-90">Member Portal</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Security Badge */}
        <div className="pt-4 sm:pt-6">
          <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg text-gray-300 text-xs sm:text-sm">
            <span className="text-yellow-400" role="img" aria-label="lock">
              🔒
            </span>
            <span>Secured Access System</span>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-4 sm:pt-6 text-gray-400 text-xs sm:text-sm">
          <p>&copy; 2025 CiaLabs. All rights reserved.</p>
        </footer>
      </div>

      {/* Background Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/3 left-1/4 w-24 sm:w-32 md:w-48 h-24 sm:h-32 md:h-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/4 w-32 sm:w-40 md:w-60 h-32 sm:h-40 md:h-60 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>
    </div>
  );
}
