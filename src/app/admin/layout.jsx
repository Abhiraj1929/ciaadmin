'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

// INLINE ADMIN SIDEBAR COMPONENT
function AdminSidebar() {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Cia-Enquires', href: '/admin/Enquires', icon: '📩' },
    { name: 'Members', href: '/admin/members', icon: '👥' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' }
  ]

  return (
    <div className="w-64 bg-gray-900 min-h-screen">
      <div className="p-6">
        <h1 className="text-white text-xl font-bold">Admin Panel</h1>
      </div>
      
      <nav className="mt-6 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 mb-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                isActive
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// INLINE ADMIN HEADER COMPONENT
function AdminHeader({ user, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Welcome back, Admin
              </h1>
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Welcome back, Admin
            </h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={onLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
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
      </div>
    </header>
  )
}

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [mounted, setMounted] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    checkAdminAuth()
  }, [])

  // Handle redirects in useEffect to avoid render-time navigation
  useEffect(() => {
    if (mounted && shouldRedirect && pathname !== '/admin/login') {
      router.push('/admin/login')
      setShouldRedirect(false)
    }
  }, [shouldRedirect, pathname, router, mounted])

  const checkAdminAuth = async () => {
    try {
      // Get current session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.log('No session found')
        setLoading(false)
        setShouldRedirect(true)
        return
      }

      const user = session.user

      if (!user) {
        console.log('No user in session')
        setLoading(false)
        setShouldRedirect(true)
        return
      }

      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)

      // If any error or no admin data
      if (adminError || !adminData || adminData.length === 0) {
        console.log('Admin verification failed')
        await supabase.auth.signOut()
        setLoading(false)
        setShouldRedirect(true)
        return
      }

      // Success
      setUser(user)
      setIsAdmin(true)
      setLoading(false)

    } catch (error) {
      console.error('Auth check failed:', error)
      setLoading(false)
      setShouldRedirect(true)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
      router.push('/admin/login')
    }
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
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
          <AdminSidebar />
          <div className="flex-1">
            <AdminHeader user={user} onLogout={handleLogout} />
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    )
  }

  // If not admin and not loading, show access denied (will redirect via useEffect)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  )
}
