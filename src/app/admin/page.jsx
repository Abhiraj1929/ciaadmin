'use client'
import { useEffect, useState, useCallback } from 'react'
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
  const [supabase] = useState(() => createClientComponentClient())

  const checkTableAndFetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      // Test table existence with minimal data fetch
      const { error: testError } = await supabase
        .from('members')
        .select('id', { count: 'exact', head: true })

      if (testError) {
        const isTableMissing = testError.code === 'PGRST116' || 
            testError.message?.includes('does not exist') ||
            testError.message?.includes('relation')
        
        const isPermissionIssue = testError.code === 'PGRST301' || 
                   testError.message?.includes('permission') ||
                   testError.message?.includes('policy')
        
        if (isTableMissing) {
          setTableExists(false)
          setError('Members table does not exist. Please create the members table first.')
          return
        } else if (isPermissionIssue) {
          setTableExists(true)
          setError('Permission denied. Please check RLS policies for members table.')
          return
        } else {
          setTableExists(false)
          setError(`Database error: ${testError.message || 'Unknown error'}`)
          return
        }
      }

      setTableExists(true)
      await fetchDashboardData()
      
    } catch (error) {
      console.error('Unexpected error:', error)
      setError('Unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const fetchDashboardData = useCallback(async () => {
    try {
      // Select only required fields for better performance
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, name, email, status, created_at')
        .order('created_at', { ascending: false })

      if (membersError) {
        setError('Failed to fetch member data: ' + (membersError.message || 'Unknown error'))
        return
      }

      if (members && members.length > 0) {
        // Calculate stats efficiently
        const statusCounts = members.reduce((acc, member) => {
          acc[member.status] = (acc[member.status] || 0) + 1
          return acc
        }, {})

        setStats({
          totalMembers: members.length,
          activeMembers: statusCounts.active || 0,
          pendingMembers: statusCounts.pending || 0,
          inactiveMembers: statusCounts.inactive || 0
        })

        // Get recent members (already sorted from query)
        setRecentMembers(members.slice(0, 5))
      } else {
        setStats({
          totalMembers: 0,
          activeMembers: 0,
          pendingMembers: 0,
          inactiveMembers: 0
        })
        setRecentMembers([])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Unexpected error occurred: ' + error.message)
    }
  }, [supabase])

  useEffect(() => {
    checkTableAndFetchData()
  }, [checkTableAndFetchData])

  const refreshData = () => {
    checkTableAndFetchData()
  }

  const createSampleTable = async () => {
    try {
      setLoading(true)
      
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

      const { error } = await supabase
        .from('members')
        .insert(sampleMembers)

      if (error) {
        setError('Failed to create sample data: ' + error.message)
      } else {
        await fetchDashboardData()
      }
    } catch (error) {
      console.error('Error creating sample data:', error)
      setError('Error creating sample data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="bg-gray-300 animate-pulse h-10 w-32 sm:w-40 rounded-lg" />
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <div className="animate-pulse">
                <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4 mb-2" />
                <div className="h-6 sm:h-8 bg-gray-300 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center text-gray-500 text-sm sm:text-base">Loading dashboard data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={refreshData}
            className="flex-1 sm:flex-none bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 text-sm transition-colors duration-200"
            aria-label="Refresh dashboard data"
          >
            <span className="inline-flex items-center gap-2">
              <span>🔄</span>
              <span className="hidden sm:inline">Refresh</span>
            </span>
          </button>
          {tableExists && (
            <Link 
              href="/admin/members/create"
              className="flex-1 sm:flex-none bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 text-center text-sm transition-colors duration-200"
            >
              <span className="inline-flex items-center gap-2">
                <span>➕</span>
                <span className="hidden sm:inline">Create New Member</span>
                <span className="sm:hidden">New Member</span>
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 sm:px-6 py-4 rounded-lg">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <span className="text-lg shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm sm:text-base">Setup Required</p>
              <p className="text-xs sm:text-sm mt-1 break-words">{error}</p>
              
              {!tableExists && (
                <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded border">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Quick Setup Instructions:</p>
                  <ol className="text-xs sm:text-sm text-gray-700 list-decimal list-inside space-y-1">
                    <li>Go to Supabase Dashboard → SQL Editor</li>
                    <li>Run the members table creation SQL</li>
                    <li>Enable Row Level Security</li>
                    <li>Create admin access policy</li>
                    <li>Refresh this page</li>
                  </ol>
                  
                  <div className="mt-3">
                    <button
                      onClick={createSampleTable}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs sm:text-sm hover:bg-blue-700 transition-colors duration-200"
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon="👥"
          bgColor="bg-blue-100"
          textColor="text-gray-900"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Active Members"
          value={stats.activeMembers}
          icon="✅"
          bgColor="bg-green-100"
          textColor="text-green-600"
          iconColor="text-green-600"
        />
        <StatCard
          title="Pending"
          value={stats.pendingMembers}
          icon="⏳"
          bgColor="bg-yellow-100"
          textColor="text-yellow-600"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Inactive"
          value={stats.inactiveMembers}
          icon="❌"
          bgColor="bg-red-100"
          textColor="text-red-600"
          iconColor="text-red-600"
        />
      </div>

      {/* Recent Members Table */}
      {tableExists && recentMembers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Members</h2>
            <Link 
              href="/admin/members" 
              className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
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
                      <StatusBadge status={member.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {recentMembers.map((member) => (
              <div key={member.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 text-sm">{member.name}</h3>
                  <StatusBadge status={member.status} />
                </div>
                <p className="text-xs text-gray-500 mb-1 break-all">{member.email}</p>
                <p className="text-xs text-gray-400">
                  {new Date(member.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Extracted StatCard component for better performance
function StatCard({ title, value, icon, bgColor, textColor, iconColor }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${textColor} mt-1`}>{value}</p>
        </div>
        <div className={`${bgColor} p-2 sm:p-3 rounded-full shrink-0`}>
          <span className={`${iconColor} text-base sm:text-xl`} role="img" aria-label={title}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  )
}

// Extracted StatusBadge component for better performance
function StatusBadge({ status }) {
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800'
  }

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || statusStyles.default}`}>
      {status}
    </span>
  )
}
