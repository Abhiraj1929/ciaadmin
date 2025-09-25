'use client'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function MemberDashboard() {
  const [memberData, setMemberData] = useState(null)
  const [resources, setResources] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchMemberData()
  }, [])

  const fetchMemberData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: member } = await supabase
          .from('members')
          .select('*')
          .eq('email', user.email)
          .single()

        setMemberData(member)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching member data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'basic': return 'bg-blue-100 text-blue-800'
      case 'premium': return 'bg-purple-100 text-purple-800'
      case 'unlimited': return 'bg-gold-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAccessLevelFeatures = (level) => {
    switch (level) {
      case 'basic': 
        return ['Basic Resources', 'Community Access', 'Email Support']
      case 'premium': 
        return ['All Basic Features', 'Premium Resources', 'Priority Support', 'Monthly Webinars']
      case 'unlimited': 
        return ['All Premium Features', 'Unlimited Downloads', '24/7 Support', 'Exclusive Content', 'Direct Admin Access']
      default: 
        return ['Limited Access']
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {memberData?.name || 'Member'}! 👋</h1>
            <p className="text-blue-100 mt-1">
              Member since {memberData?.created_at ? new Date(memberData.created_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getAccessLevelColor(memberData?.access_level)}`}>
            {memberData?.access_level?.toUpperCase() || 'BASIC'} MEMBER
          </div>
        </div>
      </div>

      {/* Account Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Account Status</p>
              <p className={`text-2xl font-bold ${
                memberData?.status === 'active' ? 'text-green-600' : 
                memberData?.status === 'pending' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {memberData?.status?.toUpperCase() || 'UNKNOWN'}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-green-600 text-xl">
                {memberData?.status === 'active' ? '✅' : 
                 memberData?.status === 'pending' ? '⏳' : '❌'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Member Role</p>
              <p className="text-2xl font-bold text-blue-600">{memberData?.role?.toUpperCase() || 'MEMBER'}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-blue-600 text-xl">👤</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Access Level</p>
              <p className="text-2xl font-bold text-purple-600">{memberData?.access_level?.toUpperCase() || 'BASIC'}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-purple-600 text-xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Access Level Features */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Access Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getAccessLevelFeatures(memberData?.access_level).map((feature, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-green-500 text-lg mr-3">✓</span>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link 
          href="/member/resources" 
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 text-xl">📚</span>
            </div>
            <h3 className="font-medium text-gray-900">Resources</h3>
            <p className="text-sm text-gray-500 mt-1">Access learning materials</p>
          </div>
        </Link>

        <Link 
          href="/member/downloads" 
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 text-xl">⬇️</span>
            </div>
            <h3 className="font-medium text-gray-900">Downloads</h3>
            <p className="text-sm text-gray-500 mt-1">Download available files</p>
          </div>
        </Link>

        <Link 
          href="/member/profile" 
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 text-xl">👤</span>
            </div>
            <h3 className="font-medium text-gray-900">My Profile</h3>
            <p className="text-sm text-gray-500 mt-1">Update your information</p>
          </div>
        </Link>

        <Link 
          href="/member/support" 
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="text-center">
            <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-yellow-600 text-xl">💬</span>
            </div>
            <h3 className="font-medium text-gray-900">Support</h3>
            <p className="text-sm text-gray-500 mt-1">Get help & contact us</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm">🔐</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Account Created</p>
                <p className="text-xs text-gray-500">
                  {memberData?.created_at ? new Date(memberData.created_at).toLocaleDateString() : 'Unknown date'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Account Activated</p>
                <p className="text-xs text-gray-500">Status: {memberData?.status || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
