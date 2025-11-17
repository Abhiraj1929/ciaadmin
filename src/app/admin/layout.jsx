'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

// MOBILE SIDEBAR OVERLAY
function MobileSidebarOverlay({ isOpen, onClose }) {
  if (!isOpen) return null
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-40 lg:hidden"
      onClick={onClose}
      aria-hidden="true"
    />
  )
}

// OPTIMIZED ADMIN SIDEBAR COMPONENT
function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname()

  const menuItems = useMemo(() => [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Cia-Enquires', href: '/admin/Enquires', icon: '📩' },
    {name: 'Performance', href: '/admin/cd2-registrationfrom', icon: '📩'},
    { name: 'Register Team', href: '/admin/register-team', icon: '🏆' },
    { name: 'Leaderboard', href: '/admin/leaderboard', icon: '🏅' },
  ], [])

  return (
    <>
      <MobileSidebarOverlay isOpen={isOpen} onClose={onClose} />
      
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 min-h-screen transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <h1 className="text-white text-lg sm:text-xl font-bold">Admin Panel</h1>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Navigation Menu */}
        <nav className="mt-6 px-3 pb-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 88px)' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center px-3 py-3 mb-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg" role="img" aria-label={item.name}>
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

// OPTIMIZED ADMIN HEADER COMPONENT
function AdminHeader({ user, onLogout, onMenuToggle }) {
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false)
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showDropdown])

  const formattedDate = useMemo(() => 
    new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), []
  )

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button + Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open sidebar menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Welcome back, Admin
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block truncate">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowDropdown(!showDropdown)
              }}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="hidden md:block text-left max-w-[150px]">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <div className="md:hidden px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

// LOADING COMPONENT
function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600 text-sm sm:text-base">{message}</p>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [supabase] = useState(() => createClientComponentClient())
  const router = useRouter()
  const pathname = usePathname()

  const checkAdminAuth = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        setLoading(false)
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
        return
      }

      const currentUser = session.user
      
      // Optimize admin check - select only necessary field
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('email')
        .eq('email', currentUser.email)
        .single()

      if (adminError || !adminData) {
        await supabase.auth.signOut()
        setLoading(false)
        router.push('/admin/login')
        return
      }

      // Success - user is authenticated admin
      setUser(currentUser)
      setIsAdmin(true)
      
      // Redirect to admin dashboard if on login page
      if (pathname === '/admin/login') {
        router.push('/admin')
      }

    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }, [supabase, pathname, router])

  useEffect(() => {
    setMounted(true)
    checkAdminAuth()
  }, [checkAdminAuth])

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
      router.push('/admin/login')
    }
  }, [supabase, router])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return <LoadingScreen />
  }

  // Loading state
  if (loading) {
    return <LoadingScreen />
  }

  // Show login page without layout
  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-gray-100">
        {children}
      </div>
    )
  }

  // Show admin panel with layout only if authenticated and admin
  if (isAdmin && user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
          <div className="flex-1 flex flex-col min-w-0 w-full">
            <AdminHeader 
              user={user} 
              onLogout={handleLogout}
              onMenuToggle={toggleSidebar}
            />
            <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </div>
    )
  }

  // If not admin and not loading, show redirect message
  return <LoadingScreen message="Redirecting to login..." />
}
