'use client'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingMembers: 0,
    inactiveMembers: 0
  })
  const [recentMembers, setRecentMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tableExists, setTableExists] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkTableAndFetchData()
  }, [])

  const checkTableAndFetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('Checking if members table exists...')

      // First, try to check if table exists by attempting a simple query
      const { data: testData, error: testError } = await supabase
        .from('members')
        .select('id')
        .limit(1)

      if (testError) {
        console.error('Members table test error:', testError)
        
        // Check different types of errors
        if (testError.code === 'PGRST116' || 
            testError.message?.includes('does not exist') ||
            testError.message?.includes('relation') ||
            testError.message?.includes('table')) {
          
          setTableExists(false)
          setError('Members table does not exist. Please create the members table first.')
          setLoading(false)
          return
        } else if (testError.code === 'PGRST301' || 
                   testError.message?.includes('permission') ||
                   testError.message?.includes('policy')) {
          
          setTableExists(true)
          setError('Permission denied. Please check RLS policies for members table.')
          setLoading(false)
          return
        } else {
          setTableExists(false)
          setError(`Database error: ${testError.message || 'Unknown error'}`)
          setLoading(false)
          return
        }
      }

      // If we reach here, table exists and is accessible
      setTableExists(true)
      await fetchDashboardData()
      
    } catch (error) {
      console.error('Unexpected error:', error)
      setError('Unexpected error occurred')
      setLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...')

      // Get member statistics
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')

      if (membersError) {
        console.error('Members fetch error:', membersError)
        setError('Failed to fetch member data: ' + (membersError.message || 'Unknown error'))
        setLoading(false)
        return
      }

      console.log('Members data fetched:', members?.length || 0, 'members')

      if (members && members.length > 0) {
        const activeCount = members.filter(m => m.status === 'active').length
        const pendingCount = members.filter(m => m.status === 'pending').length
        const inactiveCount = members.filter(m => m.status === 'inactive').length

        setStats({
          totalMembers: members.length,
          activeMembers: activeCount,
          pendingMembers: pendingCount,
          inactiveMembers: inactiveCount
        })

        // Get recent members (last 5)
        const recent = members
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
        setRecentMembers(recent)
      } else {
        // No members yet
        setStats({
          totalMembers: 0,
          activeMembers: 0,
          pendingMembers: 0,
          inactiveMembers: 0
        })
        setRecentMembers([])
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Unexpected error occurred: ' + error.message)
      setLoading(false)
    }
  }

  const refreshData = () => {
    checkTableAndFetchData()
  }

  const createSampleTable = async () => {
    try {
      setLoading(true)
      
      // This will help user create sample data
      const sampleMembers = [
        {
          name: 'Test Member 1',
          email: 'member1@test.com',
          phone: '+919876543210',
          role: 'member',
          status: 'active',
          access_level: 'basic'
        },
        {
          name: 'Test Member 2', 
          email: 'member2@test.com',
          phone: '+919876543211',
          role: 'member',
          status: 'pending',
          access_level: 'premium'
        }
      ]

      const { data, error } = await supabase
        .from('members')
        .insert(sampleMembers)
        .select()

      if (error) {
        console.error('Sample data creation error:', error)
        setError('Failed to create sample data: ' + error.message)
      } else {
        console.log('Sample data created:', data)
        await fetchDashboardData()
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error creating sample data:', error)
      setError('Error creating sample data')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="bg-gray-300 animate-pulse h-10 w-40 rounded-lg"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center text-gray-500">Loading dashboard data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-3">
          <button
            onClick={refreshData}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
          >
            🔄 Refresh
          </button>
          {tableExists && (
            <Link 
              href="/admin/members/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              ➕ Create New Member
            </Link>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-lg mr-3">⚠️</span>
            <div className="flex-1">
              <p className="font-medium">Setup Required</p>
              <p className="text-sm mt-1">{error}</p>
              
              {!tableExists && (
                <div className="mt-4 p-4 bg-gray-50 rounded border">
                  <p className="text-sm font-medium text-gray-900 mb-2">Quick Setup Instructions:</p>
                  <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
                    <li>Go to Supabase Dashboard → SQL Editor</li>
                    <li>Run the members table creation SQL (check console for code)</li>
                    <li>Enable Row Level Security</li>
                    <li>Create admin access policy</li>
                    <li>Refresh this page</li>
                  </ol>
                  
                  <div className="mt-3">
                    <button
                      onClick={createSampleTable}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      disabled={loading}
                    >
                      Try Create Sample Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards - Show even if error */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeMembers}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-green-600 text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingMembers}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Members</p>
              <p className="text-3xl font-bold text-red-600">{stats.inactiveMembers}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <span className="text-red-600 text-xl">❌</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same... */}
      {tableExists && recentMembers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Members</h2>
            <Link 
              href="/admin/members" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' :
                        member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        member.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
