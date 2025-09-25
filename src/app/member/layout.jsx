'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

// INLINE MEMBER SIDEBAR COMPONENT
function MemberSidebar() {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard', href: '/member', icon: '🏠' },
    { name: 'My Profile', href: '/member/profile', icon: '👤' },
    { name: 'Resources', href: '/member/resources', icon: '📚' },
    { name: 'Downloads', href: '/member/downloads', icon: '⬇️' },
    { name: 'Support', href: '/member/support', icon: '💬' }
  ]

  return (
    <div className="w-64 bg-blue-900 min-h-screen">
      <div className="p-6">
        <h1 className="text-white text-xl font-bold">Member Portal</h1>
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
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
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

// INLINE MEMBER HEADER COMPONENT
function MemberHeader({ memberData, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Welcome back, {memberData?.name || 'Member'}
            </h1>
            <p className="text-sm text-gray-500">
              Access Level: <span className="font-medium capitalize">{memberData?.access_level || 'basic'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              memberData?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {memberData?.status || 'Active'}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {memberData?.name?.charAt(0).toUpperCase() || 'M'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{memberData?.name || 'Member'}</p>
                  <p className="text-xs text-gray-500">{memberData?.email}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <Link
                      href="/member/profile"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={onLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
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

export default function MemberLayout({ children }) {
  const [memberData, setMemberData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      checkMemberAuth()
    }
  }, [mounted, pathname])

  const checkMemberAuth = async () => {
    console.log('=== MEMBER AUTH CHECK ===')
    console.log('Pathname:', pathname)
    console.log('Mounted:', mounted)

    // Don't check auth on login page
    if (pathname === '/member/login') {
      console.log('On login page, skipping auth check')
      setLoading(false)
      return
    }

    try {
      // Check localStorage for member data
      const memberDataString = localStorage.getItem('member')
      console.log('localStorage member data:', memberDataString ? 'EXISTS' : 'NOT_FOUND')
      
      if (!memberDataString) {
        console.log('No member data found, redirecting to login')
        router.push('/member/login')
        return
      }

      let member
      try {
        member = JSON.parse(memberDataString)
        console.log('Parsed member:', { id: member?.id, email: member?.email, status: member?.status })
      } catch (parseError) {
        console.error('Failed to parse member data:', parseError)
        localStorage.removeItem('member')
        router.push('/member/login')
        return
      }
      
      if (!member || !member.id) {
        console.log('Invalid member data structure')
        localStorage.removeItem('member')
        router.push('/member/login')
        return
      }

      console.log('Member auth successful!')
      setMemberData(member)
      setLoading(false)

    } catch (error) {
      console.error('Error in checkMemberAuth:', error)
      localStorage.removeItem('member')
      router.push('/member/login')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('member')
    setMemberData(null)
    router.push('/member/login')
  }

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show login page without layout
  if (pathname === '/member/login') {
    return (
      <div className="min-h-screen bg-gray-100">
        {children}
      </div>
    )
  }

  // Loading state for member pages
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading member portal...</p>
        </div>
      </div>
    )
  }

  // Show member portal if authenticated
  if (memberData) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <MemberSidebar />
          <div className="flex-1">
            <MemberHeader memberData={memberData} onLogout={handleLogout} />
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    )
  }

  // Default: Redirect to login
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  )
}
