'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MemberLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Check if already logged in
  useEffect(() => {
    const memberData = localStorage.getItem('member')
    if (memberData) {
      try {
        const member = JSON.parse(memberData)
        if (member && member.id) {
          router.push('/member')
          return
        }
      } catch (e) {
        localStorage.removeItem('member')
      }
    }
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Attempting login for:', email)

      const response = await fetch('/api/auth/member-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password 
        }),
      })

      console.log('Response status:', response.status)

      const result = await response.json()
      console.log('Login result:', result)

      if (result.success) {
        console.log('Login successful, storing member data')
        
        // Store member data in localStorage
        localStorage.setItem('member', JSON.stringify(result.data))
        
        // Verify data was stored
        const storedData = localStorage.getItem('member')
        console.log('Stored data:', storedData ? 'Success' : 'Failed')
        
        // Small delay to ensure localStorage is set
        setTimeout(() => {
          console.log('Redirecting to /member')
          router.push('/member')
        }, 100)
        
      } else {
        console.log('Login failed:', result.error)
        setError(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred: ' + error.message)
    } finally {
      setTimeout(() => setLoading(false), 100)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">👤</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Member Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the member portal
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">❌</span>
                {error}
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Member Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                placeholder="Enter your email address"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in to Member Portal'
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link 
              href="/admin/login" 
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Admin Login →
            </Link>
          </div>
        </form>

      </div>
    </div>
  )
}
